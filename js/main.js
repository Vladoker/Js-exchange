document.addEventListener("DOMContentLoaded", () => {
    "use strict";

  const customer = document.getElementById("customer"), //button left
        freelanser = document.getElementById("freelancer"), // button right
        blockCustomer = document.getElementById("block-customer"), //modal window customer
        blockFreelance = document.getElementById("block-freelancer"), 
        blockChoice = document.getElementById("block-choice"),
        btnExit = document.getElementById("btn-exit"),
        formCustomer = document.getElementById("form-customer"),
        ordersTable = document.getElementById("orders"),
        modalOrder = document.getElementById("order_read"),
        modalOrderActive = document.getElementById("order_active"),
        headTable = document.getElementById("headTable");



      const orders = JSON.parse(localStorage.getItem("freeOrders")) || new Array(); // получаем строку из localStorage и парсим из Json в масив
      // const orders = new Array();
      //const orders = [];

      //LocalStorage
      const toStorage = () => {
        localStorage.setItem("freeOrders",  JSON.stringify(orders));
      };

      //функция скланения
      const decOfNum = (number, titles) => number + " " + titles[(number % 100 > 4 && number % 100 < 20) ? 
      2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];

   


      const caclcDeadline = (date) => {
        const deadline = new Date(date); // дата которую получили с input
        const toDay = Date.now(); // Сегодняшняя дата в формате количесво милесекунд с 1 января 
        let remaining = (deadline - toDay) / 1000 / 60 / 60;
       

        if (remaining / 24 > 2) {
          return decOfNum(Math.floor(remaining / 24), ["день", "дня", "дней"]);
        }

        return decOfNum(Math.floor(remaining), ["час", "часа", "часов"]);
      };

      

  const renderOrders = () => {
      ordersTable.textContent = "";
      orders.forEach((value, index) => {
        ordersTable.innerHTML += `
        <tr class="order ${value.active ? 'taken' : ''}" data-number-order="${index}">
          <td>${index + 1}</td>
          <td>${value.title}</td>
          <td class="${value.currency}"></td>
          <td>${caclcDeadline(value.deadline)}</td>
        </tr>`;
      }); 
  };

  const handlerModal = (event) => {
    const target = event.target;

    const modal = target.closest(".order-modal");
    const order = orders[modal.numberOrder];
  
    
    if(target.closest(".close") || target == modal) {
      modal.style.display = "none";
    }
    
    else if(target.classList.contains("get-order")) {
      order.active = true;
      modal.style.display = "none";
      toStorage();// перезаписываем DB
      renderOrders(); // переобновляем таблицу
    }

    else if(target.id == "ready") {
      orders.splice(orders.indexOf(order), 1); // удаляем заказ из масива заказов
      modal.style.display = "none";
      toStorage();
      renderOrders(); 
    }

    else if(target.id == "capitulation") {
      order.active = false;
      modal.style.display = "none";
      toStorage();
      renderOrders();
    }

  };

  const openModal = (index) => {
    const obj = orders[index];
    
    //Диструктивное присвоения (из объекта достаём свойства)
    const { title, firstName, email, phone, description, amount, currency, deadline , active = false } = obj;

    const modal = active ? modalOrderActive : modalOrder;
   

    const firstNameBlock = modal.querySelector(".firstName"),
     modalTitleBlock  = modal.querySelector(".modal-title"),
     emailBlock = modal.querySelector(".email"),
     descriptionBlock = modal.querySelector(".description"),
     deadlineBlock = modal.querySelector(".deadline"),
     currencyImgBlock = modal.querySelector(".currency_img"),
     countBlock = modal.querySelector(".count"),
     phoneBlock = modal.querySelector(".phone");

     modal.numberOrder = index;
     modalTitleBlock.textContent = title;
     firstNameBlock.textContent = firstName;
     emailBlock.textContent = email;
     emailBlock.href = "mailto:" + email;
     descriptionBlock.textContent = description;
     deadlineBlock.textContent = caclcDeadline(deadline) ;
     currencyImgBlock.classList = "currency_img " + currency;
     countBlock.textContent = amount;
     phoneBlock ? phoneBlock.href = "tel:" + phone : "";

    //============================================================== Без диструктивного присвоения !!!
    
    //  modalTitleBlock.textContent = obj.title;
    //  firstNameBlock.textContent = obj.firstName;
    //  emailBlock.textContent = obj.email;
    //  emailBlock.href = "mailto:" + obj.email;
    //  descriptionBlock.textContent = obj.description;
    //  deadlineBlock.textContent = obj.deadline;
    //  currencyImgBlock.classList = "currency_img " + obj.currency;
    //  countBlock.textContent = obj.amount;
    //  phoneBlock ? phoneBlock.href = "tel:" + obj.phone : "";

    
     
    modal.style.display = "block";

    modal.addEventListener("click", handlerModal);


  }; 

  const sortOrder = (arr, property) => {
    arr.sort((a, b) => a[property] > b[property] ? 1 : -1); 
  };

//===================================================================== Events
  headTable.addEventListener("click", (event) => {
    const target = event.target;

    if(target.classList.contains("head-sort")) {

      if(target.id == "taskSort") {
        sortOrder(orders, "title");
      }
      else if (target.id == "currencySort") {
        sortOrder(orders, "currency");
      }
      else if (target.id == "deadlineSort") {
        sortOrder(orders, "deadline");
      }
      toStorage();
      renderOrders();
    }
  });

  ordersTable.addEventListener("click", event => {
    const elem = event.target; // поулчаем Element по которому клинкули 
    
    
    const obj = elem.closest(".order"); // поднимаемся по DOM родителю до нужного селектора и получаем этот елемент или null если нету

    //вывод data атребута у выбранного елемента в данном случае (data-number-order="${index})
    // console.dir(obj.dataset.numberOrder); 

    if(obj) {
      openModal(obj.dataset.numberOrder);
    }
  });

  customer.addEventListener("click", () => {
    blockChoice.style.display = "none";
    document.getElementById("deadline").min = new Date().toISOString().substring(0, 10); // настройка даты что бы нельзя было ставить задним числом 
    blockCustomer.style.display = "block";
    btnExit.style.display = "block";
  });

  freelanser.addEventListener("click", () => {
    blockChoice.style.display = "none";
    renderOrders();
    blockFreelance.style.display = "block";
    btnExit.style.display = "block";
  });

  btnExit.addEventListener("click", () => {
    btnExit.style.display = "none";
    blockCustomer.style.display = "none";
    blockFreelance.style.display = "none";
    blockChoice.style.display = "block";
  });

  formCustomer.addEventListener("submit", (event) => {
    event.preventDefault();
    const obj = {}; 
    
    const masElements = new Array(...formCustomer); // ElementsColection to Array
    // const masElements2 = [...formCustomer];
    // const masElements3 = Array.from(formCustomer); 


//Варианты перебора масива 

// for(const elem of masElements) {
//   if(elem.tagName === "INPUT" && elem.type !== "radio" ||
//       elem.type == "radio" && elem.checked || elem.tagName === "TEXTAREA") {
//        obj[elem.name] = elem.value;
//     }  
//   if(elem.type !== "radio") {
//     elem.value = "";
//   }
// }
// orders.push(obj);
//============================================================================================ forOf / forEach
    masElements.forEach(elem => {
      if(elem.tagName === "INPUT" && elem.type !== "radio" ||
      elem.type == "radio" && elem.checked || elem.tagName === "TEXTAREA") {
       obj[elem.name] = elem.value;
      }
      
      if(elem.type !== "radio") {
        elem.value = "";
      }
    });
    orders.push(obj);
    toStorage();
    
    formCustomer.reset();
//============================================================================================ arr.filter
    // const elementsFilter = masElements.filter((elem) => 
    // (elem.tagName === "INPUT" && elem.type !== "radio" ||
    // elem.type == "radio" && elem.checked || elem.tagName === "TEXTAREA")); 

//============================================================================================ arr.forIn

// for(const index in elementsFilter) {
//  obj[elementsFilter[index].name] = elementsFilter[index].value;

//   if(elementsFilter[index].type != "radio") {
//     elementsFilter[index].value = "";
//   }
// }
// orders.push(obj);  

  });


});