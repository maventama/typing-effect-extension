const vscode = require('vscode');

let cancelTyping = false;

function activate(context) {
    console.log('Typing Effect Extension activated');

    const pasteWithTypingDisposable = vscode.commands.registerCommand('extension.pasteWithTypingEffect', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        vscode.env.clipboard.readText().then(content => {
            content = content.trim();
            
            if (content.startsWith("```")) {
                const firstNewline = content.indexOf('\n');
                if (firstNewline !== -1) {
                    content = content.substring(firstNewline + 1);
                }
            }
            
            if (content.endsWith("```")) {
                const lastBacktickIndex = content.lastIndexOf("```");
                content = content.substring(0, lastBacktickIndex).trimEnd();
            }
            
            content = content.replace(/ {4}/g, '\t');

            const chars = content.split('');
            let i = 0;
            cancelTyping = false;

            function typeChar() {
                if (cancelTyping || i >= chars.length) {
                    console.log('Typing done or canceled');
                    return;
                }

                const char = chars[i];
                const isSpace = char === ' ';
                const isNewline = char === '\n';
                const isEndOfSentence = ['.', '?', '!'].includes(char);
                const typoChance = Math.random();

                // Simulate typo (10% chance)
                if (typoChance < 0.1 && /[a-zA-Z]/.test(char)) {
                    const typoChar = String.fromCharCode(char.charCodeAt(0) + 1);
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, typoChar);
                    }).then(() => {
                        setTimeout(() => {
                            editor.edit(editBuilder => {
                                const pos = editor.selection.active.translate(0, -1);
                                editBuilder.delete(new vscode.Range(pos, editor.selection.active));
                            }).then(() => {
                                editor.edit(editBuilder => {
                                    editBuilder.insert(editor.selection.active, char);
                                });
                                i++;
                                setTimeout(typeChar, 50 + Math.random() * 100);
                            });
                        }, 100 + Math.random() * 100);
                    });
                    return;
                }

                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, char);
                });

                i++;

                let delay = 40 + Math.random() * 100;
                if (isSpace) delay += 200 + Math.random() * 200;
                if (isNewline) delay += 600 + Math.random() * 400;
                if (isEndOfSentence) delay += 300 + Math.random() * 200;

                setTimeout(typeChar, delay);
            }

            typeChar();
        });
    });

    const cancelTypingDisposable = vscode.commands.registerCommand('extension.cancelTypingEffect', () => {
        cancelTyping = true;
        console.log('Typing effect canceled manually!');
    });

    context.subscriptions.push(pasteWithTypingDisposable, cancelTypingDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
