<?php

namespace Drupal\commerce_braintree\PluginForm\HostedFields;

use Drupal\commerce_payment\PluginForm\PaymentMethodAddForm as BasePaymentMethodAddForm;
use Drupal\Core\Form\FormStateInterface;

class PaymentMethodAddForm extends BasePaymentMethodAddForm {

  public function buildPayPalForm(array $element, FormStateInterface $form_state) {
    /** @var \Drupal\commerce_braintree\Plugin\Commerce\PaymentGateway\HostedFieldsInterface $plugin */
    $plugin = $this->plugin;

    $element['#attached']['library'][] = 'commerce_braintree/form';
    $element['#attached']['drupalSettings']['commerceBraintree'] = [
      'clientToken' => $plugin->generateClientToken(),
      'integration' => 'paypal',
      'paypalContainer' => 'paypal-container'
    ];
    $element['#attributes']['class'][] = 'braintree-form';
    // Populated by the JS library.

    $element['paypal_container'] = array(
      '#type' => 'container',
      '#id' => 'paypal-container',
    );

    $element['payment_method_nonce'] = [
      '#type' => 'hidden',
      '#attributes' => [
        'class' => ['braintree-nonce'],
      ],
    ];

    return $element;
  }


  /**
   * {@inheritdoc}
   */
  public function buildCreditCardForm(array $element, FormStateInterface $form_state) {
    /** @var \Drupal\commerce_braintree\Plugin\Commerce\PaymentGateway\HostedFieldsInterface $plugin */
    $plugin = $this->plugin;

    $element['#attached']['library'][] = 'commerce_braintree/form';
    $element['#attached']['drupalSettings']['commerceBraintree'] = [
      'clientToken' => $plugin->generateClientToken(),
      'integration' => "custom",
      'hostedFields' => [
        'number' => ['selector' => '#card-number'],
        'cvv' => ['selector' => '#cvv'],
        'expirationMonth' => ['selector' => '#expiration-month'],
        'expirationYear' => ['selector' => '#expiration-year'],
      ],
    ];
    $element['#attributes']['class'][] = 'braintree-form';
    // Populated by the JS library.
    $element['payment_method_nonce'] = [
      '#type' => 'hidden',
      '#attributes' => [
        'class' => ['braintree-nonce'],
      ],
    ];
    $element['card_type'] = [
      '#type' => 'hidden',
      '#attributes' => [
        'class' => ['braintree-card-type'],
      ],
    ];
    $element['last2'] = [
      '#type' => 'hidden',
      '#attributes' => [
        'class' => ['braintree-last2'],
      ],
    ];

    $element['number'] = [
      '#type' => 'item',
      '#title' => t('Card number'),
      '#markup' => '<div id="card-number" class="braintree-hosted-field"></div>',
    ];

    $element['expiration'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => ['credit-card-form__expiration'],
      ],
    ];
    $element['expiration']['month'] = [
      '#type' => 'item',
      '#title' => t('Month'),
      '#markup' => '<div id="expiration-month" class="braintree-hosted-field"></div>',
    ];
    $element['expiration']['divider'] = [
      '#type' => 'item',
      '#title' => '',
      '#markup' => '<span class="credit-card-form__divider">/</span>',
    ];
    $element['expiration']['year'] = [
      '#type' => 'item',
      '#title' => t('Year'),
      '#markup' => '<div id="expiration-year" class="braintree-hosted-field"></div>',
    ];
    $element['cvv'] = [
      '#type' => 'item',
      '#title' => t('CVV'),
      '#markup' => '<div id="cvv" class="braintree-hosted-field"></div>',
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  protected function validateCreditCardForm(array &$element, FormStateInterface $form_state) {
    // The JS library performs its own validation.
  }

  /**
   * {@inheritdoc}
   */
  public function submitCreditCardForm(array $element, FormStateInterface $form_state) {
    // The payment gateway plugin will process the submitted payment details.
  }

}
