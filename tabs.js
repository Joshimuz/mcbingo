// Code from Kevin Powell's video and codepen: https://codepen.io/kevinpowell/pen/oNQgRKm
// Slightly modified to work in minecraftbingo.com

const tabsContainer = document.querySelector("#rules-section");
const tabsList = tabsContainer.querySelector(".tabs-list");
const tabPanels = tabsContainer.querySelectorAll(".tab-panels > div");
const tabButtons = tabsList.querySelectorAll("a");

tabsList.setAttribute("role", "tablist");

tabsList.querySelectorAll("li").forEach((listitem) => {
	listitem.setAttribute("role", "presentation");
});

tabButtons.forEach((tab, index) => {
	tab.setAttribute("role", "tab");
	if (index === 0) {
		tab.setAttribute("aria-selected", "true");
	} else {
		tab.setAttribute("tabindex", "-1");
		tabPanels[index].setAttribute("hidden", "");
	}
});

tabPanels.forEach((panel) => {
	panel.setAttribute("role", "tabpanel");
	panel.setAttribute("tabindex", "0");
});

tabsList.addEventListener("click", (e) => {
	const clickedTab = e.target.closest("a");
	if (!clickedTab) return;
	e.preventDefault();

	switchTab(clickedTab);
});

tabsContainer.addEventListener("keydown", (e) => {
	switch (e.key) {
		case "ArrowLeft":
			moveLeft();
			break;
		case "ArrowRight":
			moveRight();
			break;
		case "Home":
			e.preventDefault();
			switchTab(tabButtons[0]);
			break;
		case "End":
			e.preventDefault();
			switchTab(tabButtons[tabButtons.length - 1]);
			break;
	}
});

function moveLeft() {
	const currentTab = tabsList.querySelector("[aria-selected=true]");
	if (!currentTab.parentElement.previousElementSibling) {
		switchTab(tabButtons[tabButtons.length - 1]);
	} else {
		switchTab(
			currentTab.parentElement.previousElementSibling.querySelector("a")
		);
	}
}

function moveRight() {
	const currentTab = tabsList.querySelector("[aria-selected=true]");
	if (!currentTab.parentElement.nextElementSibling) {
		switchTab(tabButtons[0]);
	} else {
		switchTab(currentTab.parentElement.nextElementSibling.querySelector("a"));
	}
}

function switchTab(newTab) {
	const activePanelId = newTab.getAttribute("href");
	const activePanel = tabsContainer.querySelector(activePanelId);

	tabButtons.forEach((button) => {
		button.setAttribute("aria-selected", false);
		button.setAttribute("tabindex", "-1");
	});

	tabPanels.forEach((panel) => {
		panel.setAttribute("hidden", true);
	});

	activePanel.removeAttribute("hidden", false);

	newTab.setAttribute("aria-selected", true);
	newTab.setAttribute("tabindex", "0");
	newTab.focus();
}
