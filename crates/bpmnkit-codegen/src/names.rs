//! Identifier casing shared by the emitters. ASCII only: anything else separates words, so the
//! output does not depend on locale or Unicode tables (plan I3).

fn words(s: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut cur = String::new();
    let chars: Vec<char> = s.chars().collect();
    for (i, &c) in chars.iter().enumerate() {
        if !c.is_ascii_alphanumeric() {
            if !cur.is_empty() {
                out.push(std::mem::take(&mut cur));
            }
            continue;
        }
        // `orderId` → order, Id; `HTTPServer` → HTTP, Server.
        let prev = i.checked_sub(1).map(|p| chars[p]);
        let next = chars.get(i + 1).copied();
        let lower_to_upper = c.is_ascii_uppercase()
            && prev.is_some_and(|p| p.is_ascii_lowercase() || p.is_ascii_digit());
        let acronym_end = c.is_ascii_uppercase()
            && prev.is_some_and(|p| p.is_ascii_uppercase())
            && next.is_some_and(|n| n.is_ascii_lowercase());
        if (lower_to_upper || acronym_end) && !cur.is_empty() {
            out.push(std::mem::take(&mut cur));
        }
        cur.push(c);
    }
    if !cur.is_empty() {
        out.push(cur);
    }
    out
}

/// `send-email` → `SendEmail`. Never empty, never starts with a digit.
pub fn pascal(s: &str) -> String {
    let mut out: String = words(s)
        .iter()
        .map(|w| {
            let w = w.to_ascii_lowercase_keep_acronym();
            let mut cs = w.chars();
            let first = cs
                .next()
                .map(|c| c.to_ascii_uppercase())
                .unwrap_or_default();
            format!("{first}{}", cs.as_str())
        })
        .collect();
    if out.is_empty() || out.starts_with(|c: char| c.is_ascii_digit()) {
        out.insert(0, 'X');
    }
    out
}

trait KeepAcronym {
    fn to_ascii_lowercase_keep_acronym(&self) -> String;
}

impl KeepAcronym for str {
    /// Words are lower-cased unless they are all upper case (`URL` stays `URL`).
    fn to_ascii_lowercase_keep_acronym(&self) -> String {
        if self.len() > 1
            && self
                .chars()
                .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit())
        {
            self.to_owned()
        } else {
            self.to_ascii_lowercase()
        }
    }
}

/// `order-id` → `orderId`.
pub fn lower_camel(s: &str) -> String {
    let p = pascal(s);
    let mut cs = p.chars();
    let first = cs
        .next()
        .map(|c| c.to_ascii_lowercase())
        .unwrap_or_default();
    format!("{first}{}", cs.as_str())
}

/// `send-email` → `SEND_EMAIL`.
pub fn upper_snake(s: &str) -> String {
    let w: Vec<String> = words(s).iter().map(|w| w.to_ascii_uppercase()).collect();
    let mut out = w.join("_");
    if out.is_empty() || out.starts_with(|c: char| c.is_ascii_digit()) {
        out.insert(0, 'X');
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn casing() {
        assert_eq!(pascal("send-email"), "SendEmail");
        assert_eq!(pascal("io.camunda:send_mail"), "IoCamundaSendMail");
        assert_eq!(pascal("9lives"), "X9lives");
        assert_eq!(pascal("Größe"), "GrE");
        assert_eq!(pascal("---"), "X");
        assert_eq!(lower_camel("order-ID"), "orderID");
        assert_eq!(lower_camel("orderId"), "orderId");
        assert_eq!(upper_snake("send-email"), "SEND_EMAIL");
        assert_eq!(upper_snake("orderId"), "ORDER_ID");
        assert_eq!(upper_snake("HTTPServer"), "HTTP_SERVER");
    }
}
