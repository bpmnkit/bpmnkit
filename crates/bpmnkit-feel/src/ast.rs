//! Syntax tree. Mirrors `packages/feel/src/ast.ts`; `start`/`end` are byte offsets.

use rust_decimal::Decimal;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BinaryOp {
    Add,
    Sub,
    Mul,
    Div,
    Pow,
    Eq,
    Ne,
    Lt,
    Le,
    Gt,
    Ge,
    And,
    Or,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Node {
    pub start: usize,
    pub end: usize,
    pub kind: NodeKind,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Binding {
    pub name: String,
    pub domain: Node,
}

#[derive(Debug, Clone, PartialEq)]
pub enum NodeKind {
    Number(Decimal),
    String(String),
    Boolean(bool),
    Null,
    /// `@"..."`: the literal body between the quotes, not unescaped.
    Temporal(String),
    Name(String),
    List(Vec<Node>),
    Context(Vec<(String, Node)>),
    Range {
        start_included: bool,
        low: Box<Node>,
        high: Box<Node>,
        end_included: bool,
    },
    UnaryMinus(Box<Node>),
    Binary {
        op: BinaryOp,
        left: Box<Node>,
        right: Box<Node>,
    },
    Path {
        base: Box<Node>,
        key: String,
    },
    Filter {
        base: Box<Node>,
        condition: Box<Node>,
    },
    Call {
        callee: String,
        args: Vec<Node>,
    },
    /// Invocation of a function-valued expression: `ctx.fn(1)`, `(function(a) a)(1)`.
    CallExpr {
        target: Box<Node>,
        args: Vec<Node>,
    },
    CallNamed {
        callee: String,
        args: Vec<(String, Node)>,
    },
    If {
        condition: Box<Node>,
        then: Box<Node>,
        otherwise: Box<Node>,
    },
    For {
        bindings: Vec<Binding>,
        body: Box<Node>,
    },
    Some {
        bindings: Vec<Binding>,
        satisfies: Box<Node>,
    },
    Every {
        bindings: Vec<Binding>,
        satisfies: Box<Node>,
    },
    Between {
        value: Box<Node>,
        low: Box<Node>,
        high: Box<Node>,
    },
    InTest {
        value: Box<Node>,
        test: Box<Node>,
    },
    InstanceOf {
        value: Box<Node>,
        type_name: String,
    },
    FunctionDef {
        params: Vec<String>,
        body: std::sync::Arc<Node>,
    },
    UnaryTestList(Vec<Node>),
    UnaryNot(Vec<Node>),
    AnyInput,
}
