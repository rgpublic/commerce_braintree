/**
 * @file
 * Defines behaviors for the Braintree payment method form.
 */

(function ($, Drupal, drupalSettings, braintree) {

  'use strict';

  /**
   * Attaches the commerceBraintreeForm behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the commerceBraintreeForm behavior.
   *
   * @see Drupal.commerceBraintree
   */
  Drupal.behaviors.commerceBraintreeForm = {
    attach: function (context, settings) {
      var $form = $('.braintree-form', context).closest('form');
      if ($form.length > 0) {
        var braintree = $form.data('braintree');
        if (!braintree) {
          braintree = new Drupal.commerceBraintree($form, drupalSettings.commerceBraintree);
          braintree.bootstrap();
          $form.data('braintree', braintree);
        }
      }
    },
    detach: function (context) {
      var $form = $('.braintree-form', context).closest('form');
      if ($form.length > 0) {
        var braintree = $form.data('braintree');
        if (braintree) {
          if (typeof braintree.integration!="undefined") braintree.integration.teardown();
          $form.removeData('braintree');
        }
      }
    }
  };

  /**
   * Wraps the Braintree object with Commerce-specific logic.
   *
   * @constructor
   */
  Drupal.commerceBraintree = function($form, settings) {
    this.settings = settings;
    this.$form = $form;
    this.formId = this.$form.attr('id');
    this.$submit = this.$form.find('[data-drupal-selector="edit-actions-next"]');

    //this.$form.find('#edit-submit').prop('disabled', false);

    this.$form.bind('submit', function (e) {
      $(this).find('.messages--error').remove()
    });

    return this;
  };

  Drupal.commerceBraintree.prototype.bootstrap = function () {

    var options = this.getOptions(this.settings.integration);

    braintree.setup(this.settings.clientToken, this.settings.integration, options);
    if (this.settings.integration == 'paypal') {
      this.bootstrapPaypal();
    }

  }

   Drupal.commerceBraintree.prototype.bootstrapPaypal = function() {
    this.$submit.attr('disabled', 'disabled');
   }

  Drupal.commerceBraintree.prototype.getOptions = function(integration) {
    var self = this;

    var options = {
      onError: $.proxy(this.onError, this),
    }

    var getCustomOptions = function() {
      options.id = self.formId;
      options.hostedFields = {};
      options.hostedFields = $.extend(options.hostedFields, self.settings.hostedFields);
      options.onReady = $.proxy(self.onReady, self);
      options.onPaymentMethodReceived = function (payload) {
         $('.braintree-nonce', self.$form).val(payload.nonce);
         $('.braintree-card-type', self.$form).val(payload.details.cardType);
         $('.braintree-last2', self.$form).val(payload.details.lastTwo);
         self.$form.submit();
       }

      return options;
    }

    var getPayPalOptions = function() {
      options.container = self.settings.paypalContainer;
      options.onReady = $.proxy(self.onReady, self);
      options.onPaymentMethodReceived = function (payload) {
          $('.braintree-nonce', self.$form).val(payload.nonce);
          self.$submit.removeAttr('disabled');
      }
      return options;
    }

   if (integration == 'paypal') {
      options = getPayPalOptions();
    }
    else {
      options = getCustomOptions();
    }

    return options;

  }

  Drupal.commerceBraintree.prototype.onReady = function (integration) {
    this.integration = integration;
  };

  Drupal.commerceBraintree.prototype.onError = function (response) {
    if (response.type == 'VALIDATION') {
      var message = this.errorMsg(response);

      // Show the message above the form.
      this.$form.prepend(Drupal.theme('commerceBraintreeError', message));
    }
    else {
      console.log('Other error', arguments);
    }
  };

  Drupal.commerceBraintree.prototype.errorMsg = function(response) {
    var message;

    switch (response.message) {
      case 'User did not enter a payment method':
        message = Drupal.t('Please enter your credit card details.');
        break;

      case 'Some payment method input fields are invalid.':
        var fieldName = '';
        var fields = [];
        var invalidFields = this.$form.find('.braintree-hosted-fields-invalid');

        if (invalidFields.length > 0) {
          invalidFields.each(function(index) {
            var id = $(this).attr('id');
            // @todo Get the real label.
            var fieldName = id.replace('-', ' ');

            fields.push(Drupal.t(fieldName));
          });

          if (fields.length > 1) {
            var last = fields.pop();
            fieldName = fields.join(', ');
            fieldName += ' and ' + Drupal.t(last);
            message = Drupal.t('The @field you entered are invalid.', {'@field': fieldName});
          }
          else {
            fieldName = fields.pop();
            message = Drupal.t('The @field you entered is invalid.', {'@field': fieldName});
          }

        }
        else {
          message = Drupal.t('The payment details you entered are invalid.');
        }

        message += ' ' + Drupal.t('Please check your details and try again.');

        break;

      default:
        message = response.message;
    }

    return message;
  };

  $.extend(Drupal.theme, /** @lends Drupal.theme */{
    commerceBraintreeError: function (message) {
      return $('<div role="alert">' +
        '<div class="messages messages--error">' + message + '</div>' +
        '</div>'
      );
    }
  });

})(jQuery, Drupal, drupalSettings, window.braintree);
