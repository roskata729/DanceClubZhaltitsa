const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const videoList = document.getElementById('video-list');

const noResultsMessage = document.querySelector('.no-results-message');

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const videoItems = videoList.querySelectorAll('.video-item');
    let hasResults = false; // Set a flag to check if any results are found

    videoItems.forEach(videoItem => {
        const title = videoItem.querySelector('.card-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
        videoItem.classList.add('fadein'); // Add the fadein class to show the search results
        videoItem.classList.remove('fadeout'); // Remove the fadeout class
        videoItem.style.display = '';
        hasResults = true; // Set the flag to true as there are visible search results
        } else {
        videoItem.classList.add('fadeout'); // Add the fadeout class to hide the search results
        videoItem.classList.remove('fadein'); // Remove the fadein class
        videoItem.style.display = 'none';
        }
    });

    if (!hasResults) { // If no search results are visible, show the message
        noResultsMessage.classList.remove('hide');
    } else { // Otherwise, hide the message
        noResultsMessage.classList.add('hide');
    }
});

searchInput.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        searchButton.click(); // trigger the search button click event
    }
});
