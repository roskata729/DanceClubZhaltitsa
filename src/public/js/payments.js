// Get the payment card element
const paymentCard = document.querySelector('.payment-form__item--monthly-card');
const singlePayment = document.querySelector('.payment-form__item--single-training');

// Get all the input elements inside the payment card
const paymentCardElements = paymentCard.querySelectorAll('input, label, button, hr, span');
const singlePaymentElements = singlePayment.querySelectorAll('input, label, button, select, hr, span');

// Hide all the input elements
paymentCardElements.forEach(element => {
  element.style.display = 'none';
});
singlePaymentElements.forEach(element => {
  element.style.display = 'none';
});

// Add event listener to the payment card element
paymentCard.addEventListener('click', () => {
  // Show all the input elements with appear animation
  paymentCardElements.forEach(element => {
    element.style.animation = 'appear 1.5s forwards';
    element.style.display = 'block';
  });
  singlePaymentElements.forEach(element => {
    element.style.animation = 'disappear 1.5s forwards';
    element.style.display = 'none';
  });

});

singlePayment.addEventListener('click', () => {
  // Show all the input elements with appear animation
  paymentCardElements.forEach(element => {
    element.style.animation = 'disappear 1.5s forwards';
    element.style.display = 'none';
  });
  singlePaymentElements.forEach(element => {
    element.style.animation = 'fadein 1.5s forwards';
    element.style.display = 'block';
  });

});

const multiSportDiscountField = document.getElementById("multiSportDiscount");

function updateMembershipCost() {
  const isMultiSportCardUsed = document.getElementById("multi-sport-card").checked;
  const membershipCost = document.getElementById("membership-cost");
  const currentCost = parseFloat(membershipCost.innerText);
  const multiSportDiscount = parseFloat(multiSportDiscountField.value);
  
  if (isMultiSportCardUsed) {
    const discountedCost = Math.max(currentCost - (currentCost * multiSportDiscount / 100), 0);
    membershipCost.innerText = `${discountedCost} лв`;
    membershipCost.classList.remove('text-danger');
    membershipCost.classList.add('text-success');
  } else {
    membershipCost.innerText = `${document.getElementById("membership_cost").value} лв`;
    membershipCost.classList.remove('text-success');
    membershipCost.classList.add('text-danger');
  }  
}