


// on objet qui contient des fonctions
const app = {
 

  BASE_URL: 'http://localhost:3000',

  // fonction d'initialisation, lancée au chargement de la page
  init() {
    console.log('app.init !');

    // Je suis dans l'objet app. this fait donc référence à cet objet.
    // /!\ si j'avais fait une fonction flêchée this. aurait fait référence au contexte parent : window
    this.affectEvent();
    listsModule.getListsFromAPI();
  },

  affectEvent() {
    document.getElementById('addListButton').addEventListener('click', listsModule.showAddListModal);

    const closeButtons = document.querySelectorAll('.close');
    for (let button of closeButtons) {
      button.addEventListener('click', app.closeAllModal);
    }

    document.querySelector('#addListModal form').addEventListener('submit', listsModule.submitListCreation);

    const addCardButtons = document.querySelectorAll('.add-card-button');
    for (let button of addCardButtons) {
      button.addEventListener('click', cardsModule.showAddCardModal);
    }

    document.querySelector('#addCardModal form').addEventListener('submit', cardsModule.submitCardCreation);
    document.querySelector('#addTagModal form').addEventListener('submit', tagsModule.submitTagCreation);
  },

  closeAllModal() {
    const modalWindows = document.querySelectorAll('.modal');

    for (let modal of modalWindows) {
      modal.classList.remove('is-active');
    }
  },
  
};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
// En JS lorsque l'on utilise une fonction comme callback son this peut être modifié.
// Ici ma méthode app.init sera appelé par la fonction addEventListener
// son this (à app.init) sera donc définit par la fonction addEventListener
// cette fonction donne au callback qu'elle appelle un this dépendant de l'évenement.
// Si je veux bloquer la redéfinition de this je dois appeler app.init depuis une fonction
// fléché
document.addEventListener('DOMContentLoaded',  async() => {
  try {
    await app.init();

  } catch(erreur){
    console.log(erreur);
  }

  
});