function onKeydown(evt) {
    let code = evt.code;
    if (evt.keyCode === 37 || code === 'ArrowLeft') {
        evt.inputStates.left = true;
    } else if (evt.keyCode === 38 || code === 'ArrowUp') {
        evt.inputStates.up = true;
    } else if (evt.keyCode === 39 || code === 'ArrowRight') {
        evt.inputStates.right = true;
    } else if (evt.keyCode === 40 || code === 'ArrowDown') {
        evt.inputStates.down = true;
    } else if (evt.keyCode === 32 || code === 'Space') {
        evt.inputStates.space = true;
    }
}

function onKeyup(evt) {
    let code = evt.code;
    if (evt.keyCode === 37 || code === 'ArrowLeft') {
        evt.inputStates.left = false;
    } else if (evt.keyCode === 38 || code === 'ArrowUp') {
        evt.inputStates.up = false;
    } else if (evt.keyCode === 39 || code === 'ArrowRight') {
        evt.inputStates.right = false;
    } else if (evt.keyCode === 40 || code === 'ArrowDown') {
        evt.inputStates.down = false;
    } else if (evt.keyCode === 32 || code === 'Space') {
        evt.inputStates.space = false;
    }
}