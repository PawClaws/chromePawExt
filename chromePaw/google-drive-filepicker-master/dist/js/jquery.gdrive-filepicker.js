/**!
 * Jquery Google Drive File Picker
 * By Monnot Stéphane (Shinbuntu)
 */


;(function ($, window, document, undefined) {
  var pluginName = "gdriveFilePicker",
      defaults   = {
        fixed: false,
        apiKey: null,
        clientId: null,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        features: ['google.picker.Feature.MULTISELECT_ENABLED'],
        views: ['google.picker.ViewId.DOCUMENTS'],
        onPicked: null
      }

  // The actual plugin constructor
  function GdriveFilePicker(element, options) {
    this.element = element;

    this.options   = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name     = pluginName;

    this._init();
  }

  GdriveFilePicker.prototype = {

    /**
     * Open the file picker.
     */
    open: function () {
      // Check if the user has already authenticated
      var token = gapi.auth.getToken();
      if (token) {
        this._showPicker();
      } else {
        // The user has not yet authenticated with Google
        // We need to do the authentication before displaying the Drive picker.
        this._doAuth(false, function () {
          this._showPicker();
        }.bind(this));
      }
    },

    /**
     * Init plugin
     * @private
     */
    _init: function () {
      // Events
      this.element.addEventListener('click', this.open.bind(this));

      // Disable the button until the API loads, as it won't work properly until then.
      this.element.disabled = true;

      // Load the drive API
      gapi.client.setApiKey(this.options.apiKey);
      gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this));
      google.load('picker', '1', {callback: this._pickerApiLoaded.bind(this)});
    },

    /**
     * Show the file picker once authentication has been done.
     * @private
     */
    _showPicker: function () {
      var accessToken = gapi.auth.getToken().access_token;
      this.picker     = new google.picker.PickerBuilder()
          .setAppId(this.options.clientId)
          .setOAuthToken(accessToken)
          .setCallback(this._pickerCallback.bind(this));

      for (i in this.options.views) {
        this.picker.addView(eval(this.options.views[i]));
      }

      for (i in this.options.features) {
        this.picker.enableFeature(eval(this.options.features[i]));
      }

      if (typeof this.options.beforeShow == 'function') {
        this.options.beforeShow.call(this, this.picker);
      }

      this.picker.build().setVisible(true);
    },

    /**
     * Called when a file has been selected in the Google Drive file picker.
     * @private
     */
    _pickerCallback: function (data) {
      if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
        for (i in data[google.picker.Response.DOCUMENTS]) {
          var file    = data[google.picker.Response.DOCUMENTS][i],
              id      = file[google.picker.Document.ID],
              request = gapi.client.drive.files.get({
                fileId: id
              });

          request.execute(this._fileGetCallback.bind(this));
        }
      }
    },
    /**
     * Called when file details have been retrieved from Google Drive.
     * @private
     */
    _fileGetCallback: function (file) {
      if (this.options.onPicked) {
        this.options.onPicked.call(this.element, file);
      }
    },

    /**
     * Called when the Google Drive file picker API has finished loading.
     * @private
     */
    _pickerApiLoaded: function () {
      this.element.disabled = false;
    },

    /**
     * Called when the Google Drive API has finished loading.
     * @private
     */
    _driveApiLoaded: function () {
      this._doAuth(true);
    },

    /**
     * Authenticate with Google Drive via the Google JavaScript API.
     * @private
     */
    _doAuth: function (immediate, callback) {
      if (typeof callback === 'undefined') {
        callback = function() {};
      }
      gapi.auth.authorize({
        client_id: this.options.clientId + '.apps.googleusercontent.com',
        scope: this.options.scopes,
        immediate: immediate
      }, callback);
    }
  };

  $.fn['gdriveFilePicker'] = function (options) {
    return this.each(function () {
      var data = $.data(this, "plugin_" + pluginName)
      if (!data) {
        $.data(this, "plugin_" + pluginName,
            new GdriveFilePicker(this, options));
      } else {
        $.data(this, "plugin_" + pluginName);
      }
      if (typeof options == 'string') {
        data[options]()
      }
    });
  };

})(jQuery, window, document);
