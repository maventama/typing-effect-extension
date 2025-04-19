const vscode = require('vscode');

let typingInterval = null;  // Tracking interval global untuk cancel

function activate(context) {
    console.log('Extension "typing-effect-extension" is now active!');

    let pasteWithTypingDisposable = vscode.commands.registerCommand('extension.pasteWithTypingEffect', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            vscode.env.clipboard.readText().then(content => {
                const chars = content.split('');  // Pisahkan per huruf
                console.log('Clipboard Content:', content);  // Debug log
                console.log('Characters Array:', chars);  // Debug log

                let i = 0;
                typingInterval = setInterval(() => {
                    if (i >= chars.length) {
                        clearInterval(typingInterval);
                        console.log('Typing effect complete!');
                        return;
                    }

                    editor.edit(editBuilder => {
                        console.log('Inserting Char:', chars[i]);  // Debug log
                        editBuilder.insert(editor.selection.active, chars[i]);
                    });

                    i++;
                }, 150);  // Ganti delay per huruf, bisa kamu ubah sesuka hati
            }).catch(err => {
                console.error('Error reading clipboard:', err);
            });
        }
    });

    let cancelTypingDisposable = vscode.commands.registerCommand('extension.cancelTypingEffect', () => {
        if (typingInterval) {
            clearInterval(typingInterval);
            console.log('Typing effect canceled!');
        }
    });

    context.subscriptions.push(pasteWithTypingDisposable);
    context.subscriptions.push(cancelTypingDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
