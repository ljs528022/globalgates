const inquiryActivityLayout = (() => {
    const buildEmojiSection = (title, emojis, { clearable = false, emptyText = "" } = {}) => {
        const headerAction = clearable
            ? '<button type="button" class="tweet-modal__emoji-clear" data-action="clear-recent">모두 지우기</button>'
            : "";

        const body = emojis.length
            ? `<div class="tweet-modal__emoji-grid">${emojis
                .map((emoji) => `<button type="button" class="tweet-modal__emoji-item" data-emoji="${emoji.emoji}" aria-label="${emoji.name}">${emoji.emoji}</button>`)
                .join("")}</div>`
            : `<p class="tweet-modal__emoji-empty">${emptyText}</p>`;

        return `
            <section class="tweet-modal__emoji-section">
                <header class="tweet-modal__emoji-section-header">
                    <span>${title}</span>
                    ${headerAction}
                </header>
                ${body}
            </section>
        `;
    };

    return {
        buildEmojiSection,
    };
})();
