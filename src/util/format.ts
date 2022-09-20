export function error(message: string): void {
    console.error("\x1b[41mError:\x1b[0m", message);
}

export function errorAndExit(message: string, exitCode?: number): void {
    error(message);
    process.exit(exitCode || 1);
}

export function info(message: string): void {
    console.log(message, "\n");
}

export function positive(message: string): void {
    console.log("\x1b[42m", message, "\x1b[0m\n");
}
