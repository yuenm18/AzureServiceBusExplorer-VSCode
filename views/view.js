(function () {
    let vscode = acquireVsCodeApi();
    function displayEntity(entity) {
        console.log(entity);
        let json = document.querySelector('pre');
        json.innerText = JSON.stringify(entity, null, 4);
    }

    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.command) {
            case 'refresh':
                let entity = message.entity;
                displayEntity(entity);
                break;
            default:
                break;
        }
    })
})()