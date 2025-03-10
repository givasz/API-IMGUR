console.log("Client ID carregado:", CLIENT_ID);
let showingFavorites = false;

async function fetchImages() {
    const url = "https://api.imgur.com/3/gallery/hot/viral/0.json";

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Client-ID ${CLIENT_ID}` }
        });

        const data = await response.json();
        displayImages(data.data);
    } catch (error) {
        console.error("Erro ao buscar imagens:", error);
    }
}

function displayImages(images) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";
    
    images.forEach(image => {
        if (image.images && image.images.length > 0) {
            const validImage = image.images.find(img => img.link && img.link.endsWith(".jpg") || img.link.endsWith(".png") || img.link.endsWith(".jpeg"));
            if (validImage) {
                createImageElement(validImage.link, gallery);
            }
        }
    });
}

async function uploadImage() {
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecione uma imagem primeiro!");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("https://api.imgur.com/3/upload", {
            method: "POST",
            headers: { Authorization: `Client-ID ${CLIENT_ID}` },
            body: formData
        });

        const result = await response.json();
        alert("Imagem enviada com sucesso: " + result.data.link);
        createImageElement(result.data.link, document.getElementById("gallery"));
    } catch (error) {
        console.error("Erro ao enviar imagem:", error);
    }
}

function createImageElement(imageUrl, parentElement) {
    const container = document.createElement("div");
    container.className = "image-container";

    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.alt = "Imagem do Imgur";

    const favButton = document.createElement("button");
    favButton.innerText = isFavorited(imageUrl) ? "★ Favorito" : "☆ Favoritar";
    favButton.classList.toggle("favorited", isFavorited(imageUrl));
    favButton.onclick = () => toggleFavorite(imageUrl, favButton);

    const downloadButton = document.createElement("button");
    downloadButton.innerText = "Baixar";
    downloadButton.onclick = () => downloadImage(imageUrl);

    container.appendChild(imgElement);
    container.appendChild(favButton);
    container.appendChild(downloadButton);
    parentElement.appendChild(container);
}

function toggleFavorite(imageUrl, button) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    if (favorites.includes(imageUrl)) {
        favorites = favorites.filter(url => url !== imageUrl);
    } else {
        favorites.push(imageUrl);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    button.innerText = favorites.includes(imageUrl) ? "★ Favorito" : "☆ Favoritar";
    button.classList.toggle("favorited", favorites.includes(imageUrl));
}

function isFavorited(imageUrl) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.includes(imageUrl);
}

function toggleFavorites() {
    const gallery = document.getElementById("gallery");
    const title = document.getElementById("galleryTitle");
    const favButton = document.querySelector("button[onclick='toggleFavorites()']");

    if (!showingFavorites) {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        gallery.innerHTML = "";
        title.innerText = "Imagens Favoritas";
        favButton.innerText = "Voltar";

        if (favorites.length === 0) {
            gallery.innerHTML = "<p>Nenhuma imagem favorita.</p>";
        } else {
            favorites.forEach(url => createImageElement(url, gallery));
        }
    } else {
        title.innerText = "Imagens do Imgur";
        favButton.innerText = "Ver Favoritos";
        fetchImages();
    }

    showingFavorites = !showingFavorites;
}

async function downloadImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const filename = imageUrl.split('/').pop().split('?')[0]; 

        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "imagem.jpg"; 

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Erro ao baixar imagem:", error);
    }
}

fetchImages();
