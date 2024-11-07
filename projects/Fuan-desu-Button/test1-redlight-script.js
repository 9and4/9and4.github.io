

function lightUpSquare() {
    var square = document.getElementById("square");
    var button = document.getElementById("clickButton");

    square.style.backgroundColor = "red";
    square.classList.add("glow");
    square.style.color = "rgba(255, 228, 225, 0.5)";
    button.disabled = true;

    setTimeout(function() {
        square.style.backgroundColor = "black";
        square.classList.remove("glow");
        square.style.color = "";
        button.disabled = false;
    }, 1000);
}

