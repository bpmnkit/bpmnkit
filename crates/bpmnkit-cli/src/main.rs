fn main() {
    let mut args: Vec<std::ffi::OsString> = std::env::args_os().collect();
    // The npm launcher cannot set argv0 on Windows, so it names the alias through the environment.
    if let (Some(name), Some(first)) = (std::env::var_os("BPMNKIT_ARGV0"), args.first_mut()) {
        *first = name;
    }
    std::process::exit(bpmnkit_cli::run(args));
}
