export default () => {
  // default value
  window.androidBottomInset = 0

  // called from Android native
  window.setAndroidBottomInset = function (value) {
    console.log('Bottom Inset:', value)

    window.androidBottomInset = value

    // notify Vue app
    document.dispatchEvent(new Event('android-inset-updated'))
  }
}
