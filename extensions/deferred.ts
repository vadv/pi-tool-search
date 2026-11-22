export function matchesToolPattern(name: string, pattern: string): boolean {
	const expression = pattern
		.split("*")
		.map(part => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
		.join(".*");
	return new RegExp(`^${expression}$`).test(name);
}

export function isDeferredTool(name: string, patterns: string[]): boolean {
	return patterns.some(pattern => matchesToolPattern(name, pattern));
}
