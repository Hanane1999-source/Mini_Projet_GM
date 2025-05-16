// === Récupération des éléments HTML ===
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("TelechargerImage");
const textInput = document.getElementById("memeText");
const addTextBtn = document.getElementById("AjoutText");
const fontFamily = document.getElementById("FamilleDePolices");
const fontSize = document.getElementById("TailleDePolices");
const fontColor = document.getElementById("CouleurDeLaPolice");
const bold = document.getElementById("Gras");
const italic = document.getElementById("Italique");
const galerie = document.getElementById("galerie");

let img = new Image();

// === Liste des textes validés ===
let texts = [];

// === Objet (texte) en cours d’écriture (non validé) ===
// Ce texte est temporaire jusqu’à ce qu’on clique sur "Ajouter un autre texte"
let TexteEnCoursEdition = null;

// === Drag & drop ===
let IndexDuTexteSelectionne = null;
let positionRelativeX = 0, positionRelativeY = 0;

// === Initialisation du premier texte à éditer ===
DemarrerUnNouveauTexte();

// Crée un nouveau bloc de texte vide prêt à être modifié
function DemarrerUnNouveauTexte() {
  TexteEnCoursEdition = {                                  
    text: '',                             
    x: 50,
    y: 50,                                   //nouveau texte vide sue une position de 50;50               
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    fontColor: fontColor.value,
    bold: bold.checked,
    italic: italic.checked,
    };
  textInput.value = '';                     // taper un nouveau texte
  DessinerMeme();                           // rafraîchir le canvas et dessiner l'image + le nouveau texte vide (ou préparer le canvas à recevoir ce nouveau texte)
}

// === Mise à jour dynamique du texte courant ===
textInput.addEventListener("input", () => {
  if (!TexteEnCoursEdition) return;                  //éviter une erreur si aucun mème n’est sélectionné 
  TexteEnCoursEdition.text = textInput.value;
  DessinerMeme();
});

// === Mise à jour du style du texte courant uniquement ===
[fontFamily, fontSize, fontColor, bold, italic].forEach(ctrl => {
  const MAJStyle = () => {
    if (!TexteEnCoursEdition) return;
    TexteEnCoursEdition.fontFamily = fontFamily.value;
    TexteEnCoursEdition.fontSize = fontSize.value;
    TexteEnCoursEdition.fontColor = fontColor.value;
    TexteEnCoursEdition.bold = bold.checked;
    TexteEnCoursEdition.italic = italic.checked;
    DessinerMeme();
  };
  ctrl.addEventListener("input", MAJStyle);
  ctrl.addEventListener("change", MAJStyle);
});

// === Chargement d’une image ===
imageInput.addEventListener("change", EvenementChange => {
  const file = EvenementChange.target.files[0];             //récupèrer le fichier
  if (!file) return;                                        //  arrêter si aucun fichier
  const MonLecteur = new FileReader();
  MonLecteur.onload = () => {                               //déclenchée automatiquement à la fin du chargement ou de la lecture  
    img.onload = DessinerMeme;
    img.src = MonLecteur.result;                            //result contient la Data URL après la lecture
  };
  MonLecteur.readAsDataURL(file);                           //charger le fichier en local dans le navigateur pour pérmettre de afficher une image sans serveur 
});

// === Ajouter un texte figé ===
addTextBtn.addEventListener("click", () => {
  if (!TexteEnCoursEdition || TexteEnCoursEdition.text.trim() === '') return;       // vérifie que si le texte n'est pas vide 
  texts.push({ ...TexteEnCoursEdition });                                      // utilisation du spread operator pour copie toutes les propriétés de l’objet ; ajoute un élément à la fin du tableau.
  TexteEnCoursEdition = null;                                                  // aucun texte n’est en train d’être modifié actuellement
  DemarrerUnNouveauTexte();
});

// === Fonction principale de dessin sur le canevas ===
function DessinerMeme() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);                            // éfface tout le canvas.
  if (img.src) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);          //vérifie si l’image img a bien une source chargée elle dessine l’image sur le canvas, en remplissant toute la surface du canvas.
  texts.forEach(obj => AfficherTexte(obj));                                    // patrcourir teste
  if (TexteEnCoursEdition && TexteEnCoursEdition.text.trim()) {
    AfficherTexte(TexteEnCoursEdition);                                         // afficher texte 
  }
}

// Dessine un objet texte avec style
function AfficherTexte(obj) {
  let font = '';
  if (obj.italic) font += 'italic ';                                              
  if (obj.bold) font += 'bold ';                                                  //vérifiction si les cases sont cochées
  font += `${obj.fontSize}px '${obj.fontFamily}'`;                                
  ctx.font = font;                                                                //// afficher texte  avec le police du texte 
  ctx.fillStyle = obj.fontColor;                                               //// afficher texte  avec le couleur du texte 
  ctx.fillText(obj.text, obj.x, obj.y);                                       //// afficher texte  avec le style du texte
}

// === Drag & Drop : détecter le texte sélectionné ===
function VerifierPositionTexte(x, y) {
  // On parcourt le tableau texts à l'envers (du haut vers le bas), pour détecter d'abord les textes au-dessus
  for (let i = texts.length - 1; i >= 0; i--) {
    const obj = texts[i];                                                               // Récupération de l’objet texte courant dans le tableau 
    if (!obj || !obj.text) continue;                                                    //On saute l’objet s’il est nul ou ne contient pas de texte.

    const width = ctx.measureText(obj.text).width;                                            //Mesure la largeur du texte avec le contexte du canvas (ctx)
    const height = parseInt(obj.fontSize, 10);                                          //Récupère la hauteur du texte en analysant la taille de police (fontSize) (approximatif).

    if (x > obj.x && x < obj.x + width && y > obj.y - height && y < obj.y) {            //On vérifie si (x, y) est à l'intérieur du rectangle occupé par le texte.
      IndexDuTexteSelectionne = i;
      positionRelativeX = x - obj.x;
      positionRelativeY = y - obj.y;
      return;
    }
  }

  // Vérifie aussi le texte en cours d’édition
  if (TexteEnCoursEdition && TexteEnCoursEdition.text) {                                          //Vérifie s’il y a un texte en cours d’édition == Mesure les dimensions de ce texte.
    const width = ctx.measureText(TexteEnCoursEdition.text).width;
    const height = parseInt(TexteEnCoursEdition.fontSize, 10);

    if (x > TexteEnCoursEdition.x && x < TexteEnCoursEdition.x + width &&                         
        y > TexteEnCoursEdition.y - height && y < TexteEnCoursEdition.y) {                       //Si le point touche ce texte 
      IndexDuTexteSelectionne = texts.length;                                         // On lui donne un index spécial (en dehors du tableau)
      positionRelativeX = x - TexteEnCoursEdition.x;                                       //On prépare les coordonnées pour le déplacement
      positionRelativeY = y - TexteEnCoursEdition.y;
    }
  }
}

// Appliquer le déplacement au texte sélectionné
function appliquerDeplacement(x, y) {                                                       
  if (IndexDuTexteSelectionne === null) return;                               //  Si aucun texte n’a été sélectionné, on ne fait rien
  
  let texteADeplacer;
  if (IndexDuTexteSelectionne === texts.length) {                            //si l’index vaut texts.length, c’est qu’il s’agit du texte en cours d’édition. Sinon, on déplace un texte normal du tableau.               
    texteADeplacer = TexteEnCoursEdition;
  } else {
    texteADeplacer = texts[IndexDuTexteSelectionne];
  }

  if (!texteADeplacer) return;                                                        // juste en cas ou on vérifie que le texte ciblé existe

  texteADeplacer.x = x - positionRelativeX;                                           //On applique le nouvel emplacement du texte, en prenant en compte le décalage relatif lors du clic initial.
  texteADeplacer.y = y - positionRelativeY;
  DessinerMeme();                                                               //Redessine tout le canvas avec le texte déplacé.
}

// === Gestion des événements souris ===
canvas.addEventListener("mousedown", e => {                                         //calcule la position du clic relative au canvas et on appelle la fonction VerifierPositionTexte avec avec ces coordonnées
  const rect = canvas.getBoundingClientRect();
  VerifierPositionTexte(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener("mousemove", e => {
  if (IndexDuTexteSelectionne !== null) {                                         //On vérifie qu’un texte est en cours de déplacement 
    const rect = canvas.getBoundingClientRect();                                      //On récupère la position du canvas dans la fenêtre (utile pour ajuster la position du curseur).
    appliquerDeplacement(e.clientX - rect.left, e.clientY - rect.top);                //On applique le déplacement du texte à la nouvelle position du curseur.
  }
});
canvas.addEventListener("mouseup", () => IndexDuTexteSelectionne = null);             //Quand l’utilisateur relâche le clic, on annule la sélection du texte : le drag s’arrête.
canvas.addEventListener("mouseleave", () => IndexDuTexteSelectionne = null);            //Si la souris sort du canvas pendant le déplacement, on annule aussi le drag.

// === Événements tactiles ===
canvas.addEventListener("touchstart", e => {                                                                   
  e.preventDefault();                                                                     //e.preventDefault() empêche le zoom/pan automatique du navigateur.
  const rect = canvas.getBoundingClientRect();                                            //calcule la position du la touche tactile relative au canvas et on appelle la fonction VerifierPositionTexte avec avec ces coordonnées
  const touch = e.touches[0];
  VerifierPositionTexte(touch.clientX - rect.left, touch.clientY - rect.top);
});
canvas.addEventListener("touchmove", e => {
  if (IndexDuTexteSelectionne === null) return;                                 // On n’applique le glissement que si un texte est sélectionné. 
  e.preventDefault();                                                           //preventDefault() empêche le scrolling ou zoom tactile.  
  const rect = canvas.getBoundingClientRect();                                  // Calcul des coordonnées tactiles relatives au canvas, puis appel de la fonction de déplacement.    
  const touch = e.touches[0];
  appliquerDeplacement(touch.clientX - rect.left, touch.clientY - rect.top);
});
canvas.addEventListener("touchend", () => IndexDuTexteSelectionne = null);
canvas.addEventListener("touchcancel", () => IndexDuTexteSelectionne = null);

// === Exporter le mème ===
function TelechargerMeme() {
  if (!img.src || (texts.length === 0 && (!TexteEnCoursEdition || !TexteEnCoursEdition.text))) {        //s'il y'a  pas une image et elle ne contion pas du etxte 
    alert("Ajoutez une image et du texte !");                                                           //afficher l'alert 
    return;
  }
  const link = document.createElement("a");                                                             //Crée dynamiquement un élément <a> pour lancer le téléchargement.
  link.download = "meme.png";                                                                               //Définit le nom du fichier téléchargé.
  link.href = canvas.toDataURL();                                                                          //Convertit le contenu du canvas en image au format Base64.
  link.click();                                                                                           //Simule un clic sur le lien pour déclencher le téléchargement.
  ajouterAGalerie(canvas.toDataURL());                                                                       //Ajoute l’image générée à la galerie locale ou en mémoire.
}

// === Partager le mème ===
function PartagerMeme() {
  if (!img.src || (texts.length === 0 && (!TexteEnCoursEdition || !TexteEnCoursEdition.text))) {   // Vérifie s’il y a une image chargée et au moins un texte à partager. Sinon :
    alert("Ajoutez une image et du texte !");                                                      //afficher l'alert 
    return;
  }
  canvas.toBlob(blob => {                                                                         //Convertit le contenu du canvas en objet Blob
    const file = new File([blob], "meme.png", { type: "image/png" });                               //Crée un objet File à partir du Blob, pour pouvoir le partager comme un vrai fichier.
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {                                  //Vérifie si le navigateur supporte le partage de fichiers (via l’API Web Share).
      navigator.share({                                                                             // Lance le partage natif avec titre et texte.
        files: [file],
        title: "Mème",
        text: "Voici un mème que j’ai créé !"
      }).catch(console.error);                                                                      //Si erreur : elle est simplement loguée dans la console.
    } else {
      alert("Partage non supporté sur ce navigateur.");                                             //Si l’API Web Share n’est pas disponible, on affiche un message.
    }
  });
}

// === Galerie d’images générées ===
function ajouterAGalerie(dataUrl) {
  const image = document.createElement("img");
  image.src = dataUrl;
  galerie.appendChild(image);                                                                   //Affiche une miniature du mème généré dans une galerie d’images (HTML)/
}
