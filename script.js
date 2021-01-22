let dragParameters = {};
let draggableCancelInterval = null;

const onMouseDown = event => {
    event.preventDefault();
    clearInterval(draggableCancelInterval);

    if (event.which !== 1) return;

    const dragElement = event.target.closest(".draggable-active");

    if (!dragElement) return;

    dragParameters.dragElement = dragElement;
    dragParameters.pageX = event.pageX;
    dragParameters.pageY = event.pageY;

    return false;
};

const onMouseMove = event => {
    if (!dragParameters.dragElement) return;

    if (!dragParameters.dragAvatar) {
        const moveX = event.pageX - dragParameters.pageX;
        const moveY = event.pageY - dragParameters.pageY;

        if (Math.abs(moveX) < 5 && Math.abs(moveY) < 5) return;

        dragParameters.dragAvatar = createDragAvatar(event);
        if (!dragParameters.dragAvatar) {
            dragParameters = {};
            return;
        }

        const coordinates = getCoordinates(dragParameters.dragAvatar);
        dragParameters.shiftX = dragParameters.pageX - coordinates.left;
        dragParameters.shiftY = dragParameters.pageY - coordinates.top;

        startDrag(event);
    }

    dragParameters.dragAvatar.style.left = `${event.pageX - dragParameters.shiftX}px`;
    dragParameters.dragAvatar.style.top = `${event.pageY - dragParameters.shiftY}px`;

    return false;
};

const onMouseUp = event => {
    if (dragParameters.dragAvatar) {
        finishDrag(event);
    }

    dragParameters = {};
};

const onMouseClick = event => {
    if (event.target.classList.contains("droppable-clear-button")) {
        const clearButtonParent = event.target.parentElement;
        clearButtonParent.parentElement.removeChild(clearButtonParent);
    }
    if (event.target.classList.contains("droppable-clear-all-button")) {
        const clearAllButtonParent = event.target.parentElement;
        clearAllButtonParent.nextElementSibling.innerHTML = "";
    }
};

const finishDrag = event => {
    const dropElement = findDroppable(event);

    if (!dropElement) {
        onDragCancel(dragParameters);
    } else {
        onDragEnd(dragParameters, dropElement);
    }
};

const createDragAvatar = event => {
    const dragAvatar = dragParameters.dragElement;

    dragAvatar.moveToInitialPosition = () => {
        draggableCancelInterval = setInterval(draggableCancelFrame, 5);
        function draggableCancelFrame() {
            const coordinates = getCoordinates(dragAvatar);

            if (coordinates.top === 20 && coordinates.left === 20) {
                clearInterval(draggableCancelInterval);
            } else {
                dragAvatar.style.top = coordinates.top > 35
                    ? `${coordinates.top - 15}px`
                    : coordinates.top < 5
                        ? `${coordinates.top + 15}px`
                        : "20px";
                dragAvatar.style.left = coordinates.left > 35
                    ? `${coordinates.left - 15}px`
                    : coordinates.left < 5
                        ? `${coordinates.left + 15}px`
                        : "20px";
            }
        }
    };

    return dragAvatar;
};

const getCoordinates = element => {
    const box = element.getBoundingClientRect();

    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };

};

const startDrag = () => {
    const dragAvatar = dragParameters.dragAvatar;

    dragAvatar.innerHTML = "";
    dragParameters.dragAvatar.style.backgroundColor = getRandomColor();
};

const findDroppable = event => {
    dragParameters.dragAvatar.hidden = true;

    const dragElement = document.elementFromPoint(event.clientX, event.clientY);

    dragParameters.dragAvatar.hidden = false;

    if (dragElement === null) return null;

    return dragElement.closest(".droppable");
};

const onDragCancel = dragParameters => {
    dragParameters.dragAvatar.moveToInitialPosition();
    dragParameters.dragAvatar.innerHTML = "Drag me";
    dragParameters.dragAvatar.style.backgroundColor = "#000";
};

const onDragEnd = (dragParameters, dropElement) => {
    const newDragElement = document.createElement("div");
    const dropElementCoordinates = getCoordinates(dropElement);
    const dragElementCoordinates = getCoordinates(dragParameters.dragElement);
    const clearElementButton = document.createElement("button");

    clearElementButton.innerHTML = "✕";
    clearElementButton.classList.add("droppable-clear-button");
    dragParameters.dragElement.appendChild(clearElementButton);

    newDragElement.innerHTML = "Drag me";
    newDragElement.classList.add("draggable", "draggable-active");
    document.body.insertBefore(newDragElement, document.querySelector(".droppable-common"));

    dragParameters.dragElement.classList.remove("draggable-active");
    dropElement.appendChild(dragParameters.dragElement);

    dragParameters.dragElement.style.top = `${dragElementCoordinates.top - dropElementCoordinates.top}px`;
    dragParameters.dragElement.style.left = `${dragElementCoordinates.left - dropElementCoordinates.left}px`;

    if (dropElement.classList.contains("droppable-grid")) {
        dragParameters.dragElement.classList.add("draggable-grid");
    } else {
        dragParameters.dragElement.style.zIndex = 0;
    }
};

const getRandomColor = () => {
    const colors = [
        "#D8334A",
        "#ED5565",
        "#FC6E51",
        "#FFCE54",
        "#E8CE4D",
        "#A0D468",
        "#48CFAD",
        "#A0CECB",
        "#4FC1E9",
        "#5D9CEC",
        "#8067B7",
        "#AC92EC",
        "#EC87C0"
    ];

    return colors[Math.floor(Math.random() * colors.length)];
};

document.addEventListener("mousemove", event => onMouseMove(event));
document.addEventListener("mouseup", event => onMouseUp(event));
document.addEventListener("mousedown", event => onMouseDown(event));
document.addEventListener("click", event => onMouseClick(event));