document.addEventListener("DOMContentLoaded", () => {
  const amiibosContainer = document.getElementById("amiibos");
  const seriesFilter = document.getElementById("series-filter");
  const sortAlphabeticallyBtn = document.getElementById("sortAlphabetically");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  let amiibosData = [];

  if (amiibosContainer && seriesFilter && sortAlphabeticallyBtn && searchInput && searchButton) {
    fetchAmiibos();

    sortAlphabeticallyBtn.addEventListener("click", () => {
      sortAmiibosAlphabetically("name");
    });

    searchButton.addEventListener("click", performSearch);

    if (seriesFilter) {
      seriesFilter.addEventListener("change", () => {
        const selectedSeries = seriesFilter.value;
        filterAmiibosBySeries(selectedSeries);
      });
    }

    async function fetchAmiibos() {
      try {
        const res = await fetch(`https://www.amiiboapi.com/api/amiibo/`);
        const data = await res.json();

        console.log("API Responde: ", data)

        if (data.amiibo && Array.isArray(data.amiibo)) {
          amiibosData = data.amiibo;

          amiibosContainer.innerHTML = "";

          data.amiibo.forEach(media => {
            const amiiboCard = createAmiiboCard(media);
            amiibosContainer.appendChild(amiiboCard);
          });

        } else {
          console.error("Estrutura de dados inválida")
        }
      } catch (error) {
        console.error("Erro ao fazer fetch", error);
      }
    }

    function performSearch() {
      const searchTerm = searchInput.value.trim().toLowerCase();

      if (searchTerm === "") {
        // Se a barra de pesquisa estiver vazia, exibe todos 
      } else {
        // Filtra os amiibos que correspondem
        const filteredAmiibos = amiibosData.filter((amiibo) => amiibo.name.toLowerCase().includes(searchTerm));
        renderFilteredAmiibos(filteredAmiibos);
      }
    }

    function renderFilteredAmiibos(filteredAmiibos) {
      amiibosContainer.innerHTML = "";
      filteredAmiibos.forEach((media) => {
        const amiiboCard = createAmiiboCard(media);
        amiibosContainer.appendChild(amiiboCard);
      });
    }

    function filterAmiibosBySeries(series) {
      // Clear existing amiibos
      amiibosContainer.innerHTML = "";

      amiibosData
        .filter((amiibo) => series === "All" || amiibo.gameSeries === series)
        .forEach((media) => {
          const amiiboCard = createAmiiboCard(media);
          amiibosContainer.appendChild(amiiboCard);
        });
    }

    function sortAmiibosAlphabetically(key) {
      amiibosData.sort((a, b) => {
        const valueA = a[key].toUpperCase();
        const valueB = b[key].toUpperCase();

        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }
        return 0;
      });


      amiibosContainer.innerHTML = "";
      amiibosData.forEach((media) => {
        const amiiboCard = createAmiiboCard(media);
        amiibosContainer.appendChild(amiiboCard);
      });
    }

    function createAmiiboCard(media) {
      const { name, image, head, tail } = media;

      const amiiboCard = document.createElement('div');
      amiiboCard.classList.add("amiibo-item");

      const amiiboLink = document.createElement("a");
      amiiboLink.href = "details.html?name=" + name;
      amiiboLink.classList.add("card-link");

      amiiboLink.innerHTML = `
      <img src="${image}" class="card-img">
      <div class="card-title">${name}</div>
      `;

      amiiboLink.addEventListener("click", (event) => {
        event.preventDefault();
        const amiiboName = name;
        localStorage.setItem("selectedAmiiboName", amiiboName); //GUarda o nome do amiibo no local storage
        window.location.href = event.currentTarget.href;
      });

      amiiboCard.appendChild(amiiboLink);

      return amiiboCard;
    }
  }
});



/*_________________________________________Página de Detalhes_________________________________________*/
document.addEventListener("DOMContentLoaded", () => {
  const nameAmiibo = document.getElementById("amiibo-name");
  const amiiboNamePage = document.getElementById("amiibo-name-page");
  const imagemDetalhes = document.getElementById("imagem-detalhes");
  const amiiboGameSeries = document.getElementById("game-series-name");
  const amiiboReleaseDate = document.getElementById("release-date");

  const params = new URLSearchParams(window.location.search);
  const amiiboName = params.get("name");

  if (amiiboName) {
    fetchAmiibosDetails(amiiboName)
      .then(amiibo => {
        renderAmiiboDetails(amiibo);
      })
      .catch(error => {
        console.error("Erro ao conseguir detalhes do amiibo", error);
        displayErrorMessage();
      })
  } else {
    displayErrorMessage();
  }

  async function fetchAmiibosDetails(amiiboName) {
    try {
      const res = await fetch(`https://www.amiiboapi.com/api/amiibo/?name=${amiiboName}`)
      const data = await res.json();

      if (data.amiibo && data.amiibo.length > 0) {
        const matchingAmiibo = data.amiibo.find(amiibo => amiibo.name === amiiboName);
        if (matchingAmiibo) {
          return matchingAmiibo;
        } else {
          throw new Error("Amiibo não encontrado");
        }
      } else {
        throw new Error("Estrutra de dados inválida");
      }
    } catch (error) {
      throw new Error("Erro ao conseguir detalhes do amiibo");
    }
  }

  async function renderAmiiboDetails(amiibo) {
    nameAmiibo.textContent = amiibo.name;
    amiiboNamePage.textContent = amiibo.name;

    if (amiibo.image) {
      const img = document.createElement("img");
      img.src = `https://raw.githubusercontent.com/N3evin/AmiiboAPI/master/images/icon_${amiibo.head}-${amiibo.tail}.png`;
      img.alt = "Imagem do Amiibo";
      img.classList.add("amiibo-imagem");
      imagemDetalhes.appendChild(img);
    } else {
      displayErrorMessage();
    }

    const series = document.createElement("p");
    series.textContent = amiibo.gameSeries || "Nenhuma série disponível";
    amiiboGameSeries.appendChild(series);

    const releaseDate = document.createElement("p");
    releaseDate.textContent = amiibo.release ? amiibo.release.eu || "Nenhuma data disponível" : "Nenhuma data disponível";
    amiiboReleaseDate.appendChild(releaseDate);

    console.log("Dados do Amiibo:", amiibo);
  }

  function displayErrorMessage() {
    console.error("Não conseguiu carregar os detalhes do Amiibo");
  }
});
