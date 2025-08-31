export function toHTML(input: string) {
	if (input.startsWith("http")) {
		return `<a rel="noopener nofollow" class="external-link" href="${input}" target="_blank">${input}</a>`
	}

	const link = [...input.matchAll(new RegExp("(?<=\\[\\[).*(?=\\]\\])", "gm"))][0];

	if (link && link[0]) {
		return internalLink(link[0]);
	}

	const tag = [...input.matchAll(new RegExp("(?<=\\#).*", "gm"))][0];
	if (tag && tag[0]) {
		return `<a href="#${tag[0]}" class="tag" target="_blank" rel="noopener nofollow">#${tag[0]}</a>`
	}

	return input;
}

export function internalLink(link: string, display: string = link) {
	return `<a data-href="${link}" href="${link}" class="internal-link" target="_blank" rel="noopener nofollow">${display}</a>`;
}

export function getChildren(file: TFile) {
	let children: TFile[] = [];
	this.app.vault.getMarkdownFiles().forEach((f: TFile) => {
		const fm = this.app.metadataCache.getFileCache(f).frontmatter
		if (fm && fm.parents && fm.parents.contains("[[" + file.basename + "]]")) {
			children.push(f);
		}
	});
	return children;
}

export function create(el, p_cls, html) {
	let e = el.createSpan({ cls: p_cls });
	e.innerHTML = html;
}

