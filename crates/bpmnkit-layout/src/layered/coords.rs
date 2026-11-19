//! Twin of `layout/layered/coords.ts`: Brandes–Köpf centre lines.

use super::layers::Layering;
use crate::hash::{IndexMap, IndexSet};
use crate::js::{self, cmp_num};

/// How far a node reaches above and below its centre line, labels and docked events included.
#[derive(Debug, Clone, Copy)]
pub struct Extent {
    pub above: f64,
    pub below: f64,
}

/// Clear space between two nodes of one column, and around a dummy.
const NODE_GAP: f64 = 40.0;
const DUMMY_GAP: f64 = 20.0;

fn key(a: &str, b: &str) -> String {
    if js::str_lt(a, b) {
        format!("{a}\u{1}{b}")
    } else {
        format!("{b}\u{1}{a}")
    }
}

/// Type-1 conflicts (Brandes–Köpf): a non-inner segment crossing an inner one
/// (dummy to dummy) loses its claim to be straight, so long flows stay
/// straight. Boundary segments are never aligned either.
fn conflicts(lg: &Layering) -> IndexSet<String> {
    let mut out: IndexSet<String> = IndexSet::default();
    let mut pos: IndexMap<&str, usize> = IndexMap::default();
    for layer in &lg.layers {
        for (i, id) in layer.iter().enumerate() {
            pos.insert(id, i);
        }
    }
    for segs in lg.pred.values() {
        for s in segs {
            if s.bias != 0.0 {
                out.insert(key(&s.from, &s.to));
            }
        }
    }
    for r in 1..lg.layers.len() {
        let prev = &lg.layers[r - 1];
        let layer = &lg.layers[r];
        let mut k0 = 0;
        let mut scan = 0;
        let last = layer.last();
        for (i, v) in layer.iter().enumerate() {
            let inner = if lg.dummies.contains_key(v) {
                lg.pred
                    .get(v)
                    .and_then(|segs| segs.iter().find(|s| lg.dummies.contains_key(&s.from)))
                    .map(|s| s.from.as_str())
            } else {
                None
            };
            let k1 = match inner {
                Some(inner) => pos.get(inner).copied().unwrap_or(0),
                None => prev.len(),
            };
            if inner.is_none() && Some(v) != last {
                continue;
            }
            for w in &layer[scan..i + 1] {
                for s in lg.pred.get(w).map(|v| v.as_slice()).unwrap_or(&[]) {
                    let p = pos.get(s.from.as_str()).copied().unwrap_or(0);
                    if (p < k0 || k1 < p)
                        && !(lg.dummies.contains_key(&s.from) && lg.dummies.contains_key(w))
                    {
                        out.insert(key(&s.from, w));
                    }
                }
            }
            scan = i + 1;
            k0 = k1;
        }
    }
    out
}

/// Block roots for one of the four directions.
fn align(
    layers: &[Vec<String>],
    neighbours: &dyn Fn(&str) -> Vec<String>,
    blocked: &IndexSet<String>,
) -> IndexMap<String, String> {
    let mut root: IndexMap<String, String> = IndexMap::default();
    let mut next: IndexMap<String, String> = IndexMap::default();
    let mut pos: IndexMap<&str, usize> = IndexMap::default();
    for layer in layers {
        for (i, id) in layer.iter().enumerate() {
            root.insert(id.clone(), id.clone());
            next.insert(id.clone(), id.clone());
            pos.insert(id, i);
        }
    }
    for layer in layers {
        let mut prev_idx: i64 = -1;
        for v in layer {
            let mut ws = neighbours(v);
            ws.sort_by(|a, b| {
                cmp_num(
                    pos.get(a.as_str()).copied().unwrap_or(0) as f64,
                    pos.get(b.as_str()).copied().unwrap_or(0) as f64,
                )
            });
            if ws.is_empty() {
                continue;
            }
            // floor and ceil of (len - 1) / 2
            let lo = (ws.len() - 1) / 2;
            let hi = ws.len() / 2;
            for w in &ws[lo..=hi] {
                let pw = pos.get(w.as_str()).copied().unwrap_or(0) as i64;
                if next.get(v.as_str()) == Some(v) && prev_idx < pw && !blocked.contains(&key(v, w))
                {
                    next.insert(w.clone(), v.clone());
                    let r = root[w.as_str()].clone();
                    root.insert(v.clone(), r.clone());
                    next.insert(v.clone(), r);
                    prev_idx = pw;
                }
            }
        }
    }
    root
}

/// Pack blocks as tightly as separations allow: longest path over the block graph, then pull back.
fn compact(
    layers: &[Vec<String>],
    root: &IndexMap<String, String>,
    sep: &dyn Fn(&str, &str) -> f64,
) -> IndexMap<String, f64> {
    let mut edges: IndexMap<&str, IndexMap<&str, f64>> = IndexMap::default();
    let mut in_edges: IndexMap<&str, IndexMap<&str, f64>> = IndexMap::default();
    let mut roots: Vec<&str> = Vec::new();
    let mut known: IndexSet<&str> = IndexSet::default();
    for layer in layers {
        for id in layer {
            let r = root[id.as_str()].as_str();
            if known.insert(r) {
                roots.push(r);
                edges.insert(r, IndexMap::default());
                in_edges.insert(r, IndexMap::default());
            }
        }
    }
    for layer in layers {
        for i in 1..layer.len() {
            let u = &layer[i - 1];
            let v = &layer[i];
            let ru = root[u.as_str()].as_str();
            let rv = root[v.as_str()].as_str();
            let w = js::max(
                edges
                    .get(ru)
                    .and_then(|m| m.get(rv))
                    .copied()
                    .unwrap_or(0.0),
                sep(u, v),
            );
            if let Some(m) = edges.get_mut(ru) {
                m.insert(rv, w);
            }
            if let Some(m) = in_edges.get_mut(rv) {
                m.insert(ru, w);
            }
        }
    }
    let mut indeg: IndexMap<&str, usize> = IndexMap::default();
    for &r in &roots {
        indeg.insert(r, in_edges.get(r).map_or(0, |m| m.len()));
    }
    let mut order: Vec<&str> = roots
        .iter()
        .copied()
        .filter(|r| indeg.get(r).copied() == Some(0))
        .collect();
    let mut i = 0;
    while i < order.len() {
        if let Some(m) = edges.get(order[i]) {
            for &s in m.keys() {
                let left = indeg.get(s).copied().unwrap_or(0).wrapping_sub(1);
                indeg.insert(s, left);
                if left == 0 {
                    order.push(s);
                }
            }
        }
        i += 1;
    }
    let mut xs: IndexMap<&str, f64> = IndexMap::default();
    for &r in &order {
        let mut x: f64 = 0.0;
        if let Some(m) = in_edges.get(r) {
            for (&p, &w) in m {
                x = js::max(x, xs.get(p).copied().unwrap_or(0.0) + w);
            }
        }
        xs.insert(r, x);
    }
    for i in (0..order.len()).rev() {
        let r = order[i];
        let mut min = f64::INFINITY;
        if let Some(m) = edges.get(r) {
            for (&s, &w) in m {
                min = js::min(min, xs.get(s).copied().unwrap_or(0.0) - w);
            }
        }
        if min != f64::INFINITY {
            let x = js::max(xs.get(r).copied().unwrap_or(0.0), min);
            xs.insert(r, x);
        }
    }
    let mut out: IndexMap<String, f64> = IndexMap::default();
    for layer in layers {
        for id in layer {
            out.insert(
                id.clone(),
                xs.get(root[id.as_str()].as_str()).copied().unwrap_or(0.0),
            );
        }
    }
    out
}

/// Brandes–Köpf centre lines (the cross-column axis here is y): the balanced
/// mean, then the four aligned variants, each kept only while it holds every
/// column's spacing. The caller picks one by how the flows would route.
pub fn y_candidates(lg: &Layering, extent: &dyn Fn(&str) -> Extent) -> Vec<IndexMap<String, f64>> {
    let blocked = conflicts(lg);
    let gap = |a: &str, b: &str| -> f64 {
        if lg.dummies.contains_key(a) || lg.dummies.contains_key(b) {
            DUMMY_GAP
        } else {
            NODE_GAP
        }
    };
    let mut runs: Vec<IndexMap<String, f64>> = Vec::new();
    for up in [true, false] {
        let vertical: Vec<Vec<String>> = if up {
            lg.layers.clone()
        } else {
            lg.layers.iter().rev().cloned().collect()
        };
        for left_first in [true, false] {
            let layers: Vec<Vec<String>> = if left_first {
                vertical.clone()
            } else {
                vertical
                    .iter()
                    .map(|l| l.iter().rev().cloned().collect())
                    .collect()
            };
            let neighbours = |id: &str| -> Vec<String> {
                if up {
                    lg.pred
                        .get(id)
                        .map(|v| v.as_slice())
                        .unwrap_or(&[])
                        .iter()
                        .map(|s| s.from.clone())
                        .collect()
                } else {
                    lg.succ
                        .get(id)
                        .map(|v| v.as_slice())
                        .unwrap_or(&[])
                        .iter()
                        .map(|s| s.to.clone())
                        .collect()
                }
            };
            let root = align(&layers, &neighbours, &blocked);
            let sep = |u: &str, v: &str| -> f64 {
                (if left_first {
                    extent(u).below + extent(v).above
                } else {
                    extent(u).above + extent(v).below
                }) + gap(u, v)
            };
            let mut ys = compact(&layers, &root, &sep);
            if !left_first {
                for y in ys.values_mut() {
                    *y = -*y;
                }
            }
            runs.push(ys);
        }
    }
    let span = |ys: &IndexMap<String, f64>| -> (f64, f64) {
        let mut lo = f64::INFINITY;
        let mut hi = f64::NEG_INFINITY;
        for (id, &y) in ys {
            lo = js::min(lo, y - extent(id).above);
            hi = js::max(hi, y + extent(id).below);
        }
        (lo, hi)
    };
    let mut smallest = 0;
    let mut width = f64::INFINITY;
    for (i, ys) in runs.iter().enumerate() {
        let (lo, hi) = span(ys);
        if hi - lo < width {
            width = hi - lo;
            smallest = i;
        }
    }
    let (min_s, max_s) = span(&runs[smallest]);
    for (i, ys) in runs.iter_mut().enumerate() {
        let (lo, hi) = span(ys);
        let delta = if i % 2 == 0 { min_s - lo } else { max_s - hi };
        for y in ys.values_mut() {
            *y += delta;
        }
    }
    let mut balanced: IndexMap<String, f64> = IndexMap::default();
    for id in runs[0].keys() {
        let mut v: Vec<f64> = runs
            .iter()
            .map(|ys| ys.get(id).copied().unwrap_or(0.0))
            .collect();
        v.sort_by(|a, b| cmp_num(*a, *b));
        balanced.insert(id.clone(), js::round((v[1] + v[2]) / 2.0));
    }
    let mut all = vec![balanced];
    all.extend(runs);
    all.into_iter()
        .filter(|ys| separated(lg, ys, extent, &gap))
        .collect()
}

/// True when every column keeps its order and spacing (the balanced mean can break it).
fn separated(
    lg: &Layering,
    ys: &IndexMap<String, f64>,
    extent: &dyn Fn(&str) -> Extent,
    gap: &dyn Fn(&str, &str) -> f64,
) -> bool {
    for layer in &lg.layers {
        for i in 1..layer.len() {
            let u = &layer[i - 1];
            let v = &layer[i];
            let need = extent(u).below + extent(v).above + gap(u, v);
            if ys.get(v.as_str()).copied().unwrap_or(0.0)
                - ys.get(u.as_str()).copied().unwrap_or(0.0)
                < need - 0.5
            {
                return false;
            }
        }
    }
    true
}
