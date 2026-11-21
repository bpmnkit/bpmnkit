fn main() {
    std::process::exit(bpmnkit_cli::run(std::env::args_os().collect()));
}
