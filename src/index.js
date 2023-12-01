import { Notify } from "notiflix/build/notiflix-notify-aio";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import getImages from "./api";
import createMarkup from "./create-markup";

const refs = {
    form: document.querySelector(".search-form"),
    loadMoreBtn: document.querySelector(".load-more"),
    gallery: document.querySelector(".gallery"),
    submitBtn: document.querySelector(".submit-btn")
}

let pageNumber = 1;
let userInput;
const lightbox = new SimpleLightbox('.gallery a');

refs.form.addEventListener("submit", e => {
    e.preventDefault();
    refs.loadMoreBtn.classList.add("visually-hidden");

    userInput = refs.form.elements.searchQuery.value.trim();
    pageNumber = 1;

    if (userInput === "") {
        Notify.failure("Please fill input field");
        return
    }

    refs.submitBtn.disabled = true;

    getImages(userInput, pageNumber).then(({ totalHits, hits }) => {
        if (totalHits === 0) {
            throw new Error;
        }
        Notify.success(`Hooray! We found ${totalHits} images.`);

        refs.gallery.innerHTML = createMarkup(hits);

        lightbox.refresh();
        refs.submitBtn.disabled = false;

        if (totalHits <= 40) {
            Notify.failure("We're sorry, but you've reached the end of search results.");
            return
        }

        refs.loadMoreBtn.classList.remove("visually-hidden");
    }).catch(() => {
        refs.gallery.innerHTML = "";
        refs.loadMoreBtn.classList.add("visually-hidden");
        refs.submitBtn.disabled = false;
        Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    })
})

refs.loadMoreBtn.addEventListener("click", () => {
    refs.loadMoreBtn.classList.add("visually-hidden");

    pageNumber += 1;

    getImages(userInput, pageNumber).then(({ totalHits, hits }) => {
        const markup = createMarkup(hits);
        refs.gallery.insertAdjacentHTML("beforeend", markup);

        lightbox.refresh();
        refs.loadMoreBtn.disabled = false;

        if (pageNumber >= Math.ceil(totalHits / 40)) {
            throw new Error;
        }

        refs.loadMoreBtn.classList.remove("visually-hidden");
    }).catch(() => {
        Notify.failure("We're sorry, but you've reached the end of search results.");
    })
})