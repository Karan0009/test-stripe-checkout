if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    button.addEventListener("click", addToCartClicked);
  }

  document
    .getElementsByClassName("btn-purchase")[0]
    .addEventListener("click", purchaseClicked);
  // document.querySelector(".backdrop").addEventListener("click", closeModal);
}
let total = 0;
let orders = [];

// function closeModal(e) {
//   const modalElement = document.querySelector(".payment-modal");
//   let isClickedInside = modalElement.contains(e.target);
//   if (e.target.classList.contains("btn-purchase")) isClickedInside = true;
//   console.log(isClickedInside);
//   if (!isClickedInside) {
//     closePaymentModal();
//   }
// }

// function closePaymentModal() {
//   const paymentCard = document.querySelector(".payment-modal");
//   const body = document.body;
//   body.style.height = "auto";
//   body.style.overflow = "unset";
//   body.style.paddingRight = "0px";
//   setBackdropVisibility("hidden");
//   paymentCard.classList.remove("modal-open");
//   console.log("modal closed");
// }

// function openPaymentModal() {
//   const paymentCard = document.querySelector(".payment-modal");
//   paymentCard.classList.add("modal-open");
//   const body = document.body;
//   body.style.height = "100vh";
//   body.style.overflow = "hidden";
//   body.style.paddingRight = "8px";
//   setBackdropVisibility("visible");
//   console.log("modal opened");
// }

function setBackdropVisibility(value) {
  const backdrop = document.querySelector(".backdrop");
  backdrop.style.visibility = value;
}

const stripe = Stripe(stripePublicKey);
// // console.log(stripe);
// const elements = stripe.elements();
// const stripeCardNumber = elements.create("cardNumber", {
//   style: {
//     base: {
//       fontSize: "20px",
//       fontWeight: "bold",
//       backgroundColor: "white",
//       color: "black",
//     },
//     invalid: {
//       color: "red",
//     },
//   },
// });
// const stripeCardExpiry = elements.create("cardExpiry", {
//   style: {
//     base: {
//       fontSize: "20px",
//       fontWeight: "bold",
//       backgroundColor: "white",
//       color: "black",
//     },
//     invalid: {
//       color: "red",
//     },
//   },
// });
// const stripeCardCvv = elements.create("cardCvc", {
//   style: {
//     base: {
//       fontSize: "20px",
//       fontWeight: "bold",
//       backgroundColor: "white",
//       color: "black",
//     },
//     invalid: {
//       color: "red",
//     },
//   },
// });
// stripeCardNumber.mount("#card-number");
// stripeCardExpiry.mount("#card-expiry");
// stripeCardCvv.mount("#card-cvv");

function purchaseClicked() {
  // alert("Thank you for your purchase");
  // var cartItems = document.getElementsByClassName("cart-items")[0];
  // while (cartItems.hasChildNodes()) {
  //   cartItems.removeChild(cartItems.firstChild);
  // }
  // updateCartTotal();
  // const priceElement = document.querySelector(".cart-total-price");
  // const price = parseFloat(priceElement.innerText.replace("$", ""));
  // stripeHandler.open({
  //   amount: price,
  // });
  // openPaymentModal();
}

function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  console.log(buttonClicked.closest(".cart-quantity").dataset.itemId);
  const index = orders.findIndex(
    (order) =>
      parseInt(order.id) ===
      parseInt(buttonClicked.closest(".cart-quantity").dataset.itemId)
  );
  orders.splice(index, 1);
  updateCartTotal();
}

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  const temp = orders.find(
    (order) =>
      parseInt(order.id) ===
      parseInt(input.closest(".cart-quantity").dataset.itemId)
  );
  if (temp) {
    temp.quantity = input.value;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  var button = event.target;
  var shopItem = button.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var itemId = shopItem.dataset.itemId;
  addItemToCart(itemId, title, price, imageSrc);

  updateCartTotal();
}

function addItemToCart(id, title, price, imageSrc) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }
  orders.push({ id: id, quantity: 1 });
  var cartRowContents = `
        <div class="cart-item cart-column" >
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column" data-item-id="${id}"> 
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function updateCartTotal() {
  console.log("updated");
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var price = parseFloat(priceElement.innerText.replace("$", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100;

  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}

// const orderData = {
//   products: [
//     { id: "1", quantity: 2 },
//     { id: 5, quantity: 1 },
//   ],
// };

const payNowBtn = document.querySelector(".btn-purchase");
payNowBtn.addEventListener("click", () => {
  console.log(orders);
  fetch("http://localhost:8080/checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orders),
  })
    .then((data) => {
      return data.json();
    })
    // .then((parsedData) => {
    //   console.log(parsedData);
    // })
    .then((parsedData) => {
      return stripe.redirectToCheckout({ sessionId: parsedData.id });
    })
    .then((result) => {
      console.log(result);
      if (result.error) console.log(result.error.message);
    })
    .catch((err) => {
      console.log("error", JSON.parse(err));
    });
});
