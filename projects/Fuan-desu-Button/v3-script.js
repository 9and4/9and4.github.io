// Get references to the button and count display elements
const button = document.getElementById("clickButton");
const countDisplay = document.getElementById("countDisplay");
const chartCanvas = document.getElementById("chart");

// Set up the initial count
let count = getClickCount(); // Retrieve the click count from localStorage
let clickCountData = getClickCountData(); // Retrieve the click count data from localStorage

// Create an audio element
const audio = new Audio("female-audio-fuanndesu.wav");

// Update the count display
function updateCount() {
  countDisplay.textContent = `好棒，已經「不安」了 ${count} 次！`;
}

// Function to retrieve the click count from localStorage
function getClickCount() {
  const storedCount = localStorage.getItem("clickCount");
  return storedCount ? parseInt(storedCount) : 0;
}

// Function to retrieve the click count data from localStorage
function getClickCountData() {
  const storedData = localStorage.getItem("clickCountData");
  return storedData ? JSON.parse(storedData) : { labels: [], data: [] };
}

// Function to increment the click count
function incrementClickCount() {
  const currentDate = new Date().toLocaleDateString();

  // Check if click count for the current date already exists
  const index = clickCountData.labels.indexOf(currentDate);
  if (index !== -1) {
    clickCountData.data[index]++;
  } else {
    clickCountData.labels.push(currentDate);
    clickCountData.data.push(1);
  }

  updateChart(); // Call the updateChart() function to update the chart
}

// Update the count when the button is clicked
function handleButtonClick() {
  count++;
  updateCount();
  incrementClickCount();
  // Play the audio
  audio.play();
}

// Function to remove box shadow and move the button downward
function removeBoxShadow() {
  button.style.boxShadow = "none";
  button.style.transform = "translateY(5px)";
}

// Function to restore box shadow and return the button to its original position
function restoreBoxShadow() {
  button.style.boxShadow = "0px 3px 6px rgba(0, 0, 0, 0.16)";
  button.style.transform = "translateY(0)";
}

// Add event listeners to handle button interactions
button.addEventListener("mousedown", function () {
  removeBoxShadow();
});

button.addEventListener("mouseup", function () {
  restoreBoxShadow();
  handleButtonClick(); // Call handleButtonClick() when the mouse button is released
});

button.addEventListener("mouseout", function () {
  restoreBoxShadow();
});

button.addEventListener("touchstart", function () {
  event.preventDefault(); // Prevent scrolling on touch devices
  removeBoxShadow();
});

button.addEventListener("touchend", function () {
  restoreBoxShadow();
  handleButtonClick(); // Call handleButtonClick() when the touch is released
});

// Add a keydown event listener to the document, and check if the pressed key is the Enter key or the Spacebar
document.addEventListener("keydown", function (event) {
  if (event.code === "Enter" || event.code === "Space") {
    event.preventDefault(); // Prevent scrolling the page
    removeBoxShadow();
  }
});

// Add a keyup event listener to the document, and check if the released key is the Enter key or the Spacebar
document.addEventListener("keyup", function (event) {
  if (event.code === "Enter" || event.code === "Space") {
    event.preventDefault(); // Prevent scrolling the page
    restoreBoxShadow();
    handleButtonClick(); // Call the button click handler
  }
});

// Hide the chart initially
chartCanvas.style.display = "none";

// Function to toggle the chart display
function toggleChartDisplay() {
  if (chartCanvas.style.display === "none") {
    chartCanvas.style.display = "block";
    showChartButton.textContent = "收起統計圖";
  } else {
    chartCanvas.style.display = "none";
    showChartButton.textContent = "展開統計圖";
  }
}

// Event listener for the "Show Chart!" button
const showChartButton = document.getElementById("showChartButton");
showChartButton.addEventListener("click", function () {
  toggleChartDisplay();
  updateChart(); // Call updateChart() when the button is clicked to create or update the chart
});

// Function to update the chart
function updateChart() {
  const ctx = chartCanvas.getContext("2d");

  // Create a new chart or update the existing chart
  if (window.myChart) {
    window.myChart.data.labels = clickCountData.labels;
    window.myChart.data.datasets[0].data = clickCountData.data;
    window.myChart.update();
  } else {
    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: clickCountData.labels,
        datasets: [
          {
            label: "「不安」次數（Click Count）",
            data: clickCountData.data,
            backgroundColor: "rgba(0, 123, 255, 0.5)",
            borderColor: "rgba(0, 123, 255, 1)",
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Save the click count to localStorage when the page is unloaded
window.addEventListener("beforeunload", function () {
  localStorage.setItem("clickCount", count.toString());
  localStorage.setItem("clickCountData", JSON.stringify(clickCountData));
});

// Initialize the count display
updateCount();

// Event listener for the "Reset Data for Today" button
const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", function () {
  // Display the confirmation pop-up
  const confirmation = confirm("你确定要將今天的“不安”清零吗？Are you sure you want to reset the data for today?");
  if (confirmation) {
    resetDataForToday();
    updateCount(); // Update the count display
    updateChart();
  }
});

// Function to reset the data for the current day
function resetDataForToday() {
  const currentDate = new Date().toLocaleDateString();
  const index = clickCountData.labels.indexOf(currentDate);

  if (index !== -1) {
    clickCountData.labels.splice(index, 1);
    clickCountData.data.splice(index, 1);
    count = 0; // Reset the count to zero
  }
}


// Initialize the count display
updateCount();

// 切换使用说明的显示和隐藏
function toggleInstructions() {
  const instructions = document.getElementById('usageInstructions');
  const button = document.getElementById('toggleInstructions');
  
  // 如果说明已显示，则隐藏它，否则显示它
  if (instructions.style.display === 'none' || instructions.style.display === '') {
      instructions.style.display = 'block';  // 显示使用说明
      button.innerText = '隐藏使用说明';  // 更改按钮文本为“隐藏”
  } else {
      instructions.style.display = 'none';  // 隐藏使用说明
      button.innerText = '查看使用说明';  // 更改按钮文本为“查看”
  }
}
