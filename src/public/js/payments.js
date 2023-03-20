// Get the payment card element
const paymentCard = document.querySelector('.payment-form__item--monthly-card');
const multisportCard = document.querySelector('.payment-form_item--multisport-card');
const singlePayment = document.querySelector('.payment-form__item--single-training');

// Get all the input elements inside the payment card
const paymentCardElements = paymentCard.querySelectorAll('input, label, button, hr');
const multisportCardElements = multisportCard.querySelectorAll('button, hr');
const singlePaymentElements = singlePayment.querySelectorAll('input, label, button, select, hr');

// Hide all the input elements
paymentCardElements.forEach(element => {
  element.style.display = 'none';
});
multisportCardElements.forEach(element => {
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
  multisportCardElements.forEach(element => {
    element.style.animation = 'disappear 1.5s forwards';
    element.style.display = 'none';
  });
  singlePaymentElements.forEach(element => {
    element.style.animation = 'disappear 1.5s forwards';
    element.style.display = 'none';
  });

});

multisportCard.addEventListener('click', () => {
  // Show all the input elements with appear animation
  paymentCardElements.forEach(element => {
    element.style.animation = 'disappear 1.5s forwards';
    element.style.display = 'none';
  });
  multisportCardElements.forEach(element => {
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
  multisportCardElements.forEach(element => {
    element.style.animation = 'disappear 1.5s forwards';
    element.style.display = 'none';
  });
  singlePaymentElements.forEach(element => {
    element.style.animation = 'fadein 1.5s forwards';
    element.style.display = 'block';
  });

});