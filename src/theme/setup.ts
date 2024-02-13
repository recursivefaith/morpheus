import Splitting from 'splitting'
import {HeleniteCore} from 'main'

export default class setupTheme {
  plugin: HeleniteCore
  
  constructor (plugin: HeleniteCore) {
    this.plugin = plugin
    this.applySplittingToTitle()
  }

  applySplittingToTitle () {
    console.log('splitting')
  }
}