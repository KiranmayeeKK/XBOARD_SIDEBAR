

function init() {
    //Add event from js the keep the marup clean
    document.getElementById("menu-btn").addEventListener("click", toggleMenu);
    document.getElementById("body-overlay").addEventListener("click", toggleMenu);
    window.addEventListener('load', (event) => {
        populateSidebar();
       
    });
    window.addEventListener('resize', (event) => {
        populateSidebar();
    });

    /* To update screen elements in javascript.
    var mdScreen = window.matchMedia("(min-width: 768px)")
    mdScreen.addEventListener("change", updateMDDisplay);
    var xlScreen = window.matchMedia("(min-width: 1200px)")
    xlScreen.addEventListener("change", updateXLDisplay);
    */
}
function populateSidebar() {
    if(window.matchMedia("(max-width: 767px)").matches) {
        console.log("if");
            /* To populate sidebar with relevant topics*/
            const buttonSideBar = document.getElementById("button-sidebar");
            buttonSideBar.innerHTML= createSidebarElements("sidebar-toc", "related-topics","accordion"); 
            const sidebar = document.getElementById("side-bar");
            sidebar.innerHTML= "";
     }
     else
     {
         console.log("else");
         const sidebar = document.getElementById("side-bar");
         sidebar.innerHTML= createSidebarElements("sidebar-toc", "related-topics","accordion");
         const buttonSideBar = document.getElementById("button-sidebar");
         buttonSideBar.innerHTML= "";
     }
     populateRelatedTopics();

     loadLatestNews(main_topic);
}

function createSidebarElements(tocDivID, relatedTopicsDivID, accordionDivID) {
    console.log("createSidebarElements", tocDivID, relatedTopicsDivID, accordionDivID);
    return `<div class=" d-flex flex-column">
    <div id="${tocDivID}"></div>
    <div id="${relatedTopicsDivID}">
        <h4>Related Topics</h4>
        <div class="accordion accordion-flush" id="${accordionDivID}">
        </div>
    </div>
</div>`;
}

/* In case of small screen, a toggle button apeears on the top and this function 
checks if the toggle button is clicked or not and render the ui accordingly 
1. when a button is clicked an overlay is placed on the whole screen and nav element
is displayed on the top*/
function toggleMenu() {
    var overlayElem = document.getElementById("body-overlay");
    var navElem = document.querySelector(".real-menu-custom");
    if(overlayElem.style.display != "block")
    {
    overlayElem.style.display = "block";
    navElem.style.left = "0px";
    }
    else
    {
    overlayElem.style.display = "none";
    navElem.style.left = "-300px";
    }
}

//Prevent the function to run before the document is loaded
document.addEventListener('readystatechange', function() {
    if (document.readyState === "complete") {
        init();
    }
});


function populateRelatedTopics() {
    topics.forEach(async (element,index)  => {
       await  addAccordionItem(element, index);
        
    });

}

async function addAccordionItem(title, index) {
    console.log(addAccordionItem);
    const accordionID = "accordion-item"+index;
    const headingID = "heading"+index;
    const collapseID = "collapse"+index;
      const accordionDiv = document.getElementById("accordion");
      accordionDiv.innerHTML += `<div class="accordion-item" id="${accordionID}">
      <h2 class="accordion-header" id="${headingID}">
        <button class="accordion-btn-css collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseID}" aria-expanded="false" aria-controls="${collapseID}">
      ${title}
        </button>
      </h2>
      <div id="${collapseID}" class="accordion-collapse collapse" aria-labelledby="${headingID}" data-bs-parent="#accordion">
      </div>
    </div> `
    await addAccordionSubItems(title, index);
  }


async function addAccordionSubItems(title, index) {
    
    const ulElement = document.createElement("ul");

    if(rssLinks[title])
    {
       const resJSON = await getJSON(rssLinks[title]);
       const accordionID = "accordion-item"+index;
       const headingID = "heading"+index;
       const collapseID = "collapse"+index;
       const collapseDiv = document.getElementById(collapseID);
       if(resJSON != null )
       {
    
    const ulElement = document.createElement("ul");
    for(let i = 0; i < resJSON.items.length; i++) {
        const liElement = document.createElement("li");
        const itemID = getItemID(title, i);
        liElement.textContent = resJSON.items[i].title;
        liElement.classList.add("list-item-custom");
        liElement.setAttribute("id", itemID);
        liElement.addEventListener("click",(e) => updateLatestNews(e));
        ulElement.append(liElement);
        ulElement.append(document.createElement("hr"));
    }
    collapseDiv.append(ulElement);
}
}
}


async function getJSON(rssLink) {
    try {
      const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url="+encodeURI(rssLink)+"&api_key=riabcci2abn0kxstsyzuq3v4xgpvb3d6bsxnxtuf");
      if(res.ok) {
      const resJSON = await res.json();
      return resJSON;
      }
      }
      catch(err) {
        console.log(err);
      }
      return null;
  }

  async function loadLatestNews(topic) {
  
    if(rssLinks[topic])
    {   
        const resJSON = await getJSON(rssLinks[topic]);
        const displayDiv = document.getElementById("display-window");
        displayDiv.innerHTML = `<h2>${topic}</h2>`;
        resJSON.items.forEach((item,idx) =>  {
           displayDiv.innerHTML += createCard(item, topic, idx);
           
        })
        const sidebarTOCElem = document.getElementById("sidebar-toc");
        const tocElem = document.getElementById("toc");
        sidebarTOCElem.innerHTML = `<h4>News in this article</h4>`;
        tocElem.innerHTML = `<h4>News in this article</h4>`;
        if(window.matchMedia("(max-width: 1200px)").matches) {
        appendtoTOC(sidebarTOCElem, resJSON.items, topic);
        }
        else {
        appendtoTOC(tocElem, resJSON.items, topic);
        }
    }
 
}

async function updateLatestNews(e) {
    const topic = e.target.id.split("_")[0];
    const cardID = getCardID(topic, e.target.id.split("_")[1]);
    await loadLatestNews(topic);
    const scrollTo  = document.getElementById(cardID);
    console.log(scrollTo);
    scrollTo.scrollIntoView();
}


function createCard(item, topic, idx) {
    const cardID = getCardID(topic, idx); 
    return ` <div id =${cardID}>
  <a href="${item.link}">
  <div class="card card-css p-2">
  <img src="${item.enclosure.link}" alt="${item.title}"/>
  <div class="card-body px-0 w-100 d-flex flex-column">
  <div class="card-title"><h5>${item.title}</h5></div>
  <div class="card-subtitle font-monospace card-subtitle-css">${item.author} 
  <span>&#8226;</span>
  ${new Date(item.pubDate).toLocaleDateString("en-IN")} 
  </div>
  <p class="card-text card-text-css text-wrap" style="flex-basis:content">${item.content}</p>
  </div>
</div>
</a>
</div>`
}

function appendtoTOC(elem, items, topic) {

    const ulElement = document.createElement("ul");
    items.forEach((item, idx) => {
        const itemID = getItemID(topic,idx);
        const cardID = getCardID(topic, idx);
        const liElement = document.createElement("li");
        liElement.innerHTML = `<a href="#${cardID}">${item.title}</a>`
        liElement.classList.add("list-item-custom");
        liElement.setAttribute("id", itemID);
        ulElement.append(liElement);
        ulElement.append(document.createElement("hr"));
    })
    elem.append(ulElement);
}

function getItemID(title, index) {
    return title+"_"+index;
}

function getCardID(title, index) {
    return "card_"+title+"_"+index;
}
/*

function updateMDDisplay(e) {
    if(e.matches)
    {
    document.querySelector("#side-bar").style.display="block";
    document.getElementById("menu-btn").style.display= "none";
    }
    else
    {
        document.querySelector("#side-bar").style.display="none";
        document.getElementById("menu-btn").style.display= "block";
    }
}

function updateXLDisplay(e) {
    if(e.matches)
    {
    document.querySelector(".toc-bar-custom").style.display="block";
    }
    else
    {
        document.querySelector(".toc-bar-custom").style.display="none";
    }
}



*/