import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    form: document.querySelector(".search-form"),
    loadMoreBtn: document.querySelector(".load-more"),
    gallery: document.querySelector(".gallery")
}

async function getImages(searchQuery, pageNumber) {
    const searchParams = new URLSearchParams({
        key: "40998615-e942d78fa7d7f729cbc4e5126",
        q: searchQuery,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: pageNumber,
        per_page: 40
    });
    const URL = `https://pixabay.com/api/?${searchParams}`

    const fetchResult = await axios.get(URL);
    const { data } = fetchResult;

    return data;
}

function createMarkup(arr) {
    return arr.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) =>
        `<div class="photo-card">
            <a href="${largeImageURL}" class="img-link">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes</b> ${likes}
                </p>
                <p class="info-item">
                    <b>Views</b> ${views}
                </p>
                <p class="info-item">
                    <b>Comments</b> ${comments}
                </p>
                <p class="info-item">
                    <b>Downloads</b> ${downloads}
                </p>
            </div>
        </div>`
    ).join("");
}

let pageNumber = 1;
const lightbox = new SimpleLightbox('.gallery a')

refs.form.addEventListener("submit", e => {
    e.preventDefault();
    refs.loadMoreBtn.classList.add("visually-hidden");

    const userInput = refs.form.elements.searchQuery.value;
    pageNumber = 1;

    getImages(userInput, pageNumber).then(({ totalHits, hits }) => {
        if (totalHits === 0) {
            throw new Error;
        }
        Notify.success(`Hooray! We found ${totalHits} images.`);

        refs.gallery.innerHTML = createMarkup(hits);

        lightbox.refresh()
        if (totalHits > 40) {
            refs.loadMoreBtn.classList.remove("visually-hidden");
        }
    }).catch(() => {
        refs.gallery.innerHTML = "";
        refs.loadMoreBtn.classList.add("visually-hidden");
        Notify.failure("Sorry, there are no images matching your search query. Please try again.")
    })
})

refs.loadMoreBtn.addEventListener("click", e => {
    const userInput = refs.form.elements.searchQuery.value;

    pageNumber += 1;

    getImages(userInput, pageNumber).then(({ totalHits, hits }) => {
        if (40 * pageNumber > totalHits) {
            throw new Error
        }

        const markup = createMarkup(hits);
        refs.gallery.insertAdjacentHTML("beforeend", markup);

        lightbox.refresh()
    }).catch(() => {
        refs.loadMoreBtn.classList.add("visually-hidden");
        Notify.failure("We're sorry, but you've reached the end of search results.")
    })
})