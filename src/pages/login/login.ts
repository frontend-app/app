import { Component }      from '@angular/core'
import {
  Push,
  User,
}                         from '@ionic/cloud-angular'
import {
  AlertController,
  LoadingController,
  Loading,
  NavController,
}                         from 'ionic-angular'

import { Auth }           from '../../providers/auth'

import { Brolog }         from 'brolog'

import { DashboardPage }  from '../../pages/dashboard/'

@Component({
  selector:     'page-login',
  templateUrl:  'login.html',
})
export class LoginPage {
  private loading: Loading | null

  public email:     string
  public password:  string

  constructor(
    public alertCtrl:   AlertController,
    public auth:        Auth,
    public log:         Brolog,
    public loadingCtrl: LoadingController,
    public navCtrl:     NavController,
    public push:        Push,
    public user:        User,
  ) {
    this.log.verbose('LoginPage', 'constructor()')
    // this.userService.user.subscribe(userInfo => {
    //   this.userInfo = userInfo
    // })
  }

  ionViewDidLoad() {
    this.log.verbose('LoginPage', 'ionViewDidLoad()')

    if (this.auth.authenticated()) {
      this.gotoDashboardPage()
    }

  }

  async login(): Promise<void> {
    this.log.verbose('LoginPage', 'login()')

    try {
      const authResult = await this.auth.login()
      this.log.silly('LoginPage', 'loginEmail() successful! %s', JSON.stringify(authResult))
      this.gotoDashboardPage()
    } catch (e) {
      this.log.warn('LoginPage', 'login() exception: %s', e && e.message || e)

      this.alertCtrl.create({
        title:    'Login Error',
        subTitle: 'Exception: ' + e.message,
        buttons:  ['OK'],
      }).present()
    }

  }

  logout(): void {
    this.log.verbose('LoginPage', 'logout()')
    this.auth.logout()
    this.navCtrl.setRoot(LoginPage)
  }

  showLoader(): void {
    this.log.verbose('LoginPage', 'showLoader()')

    this.loading = this.loadingCtrl.create({
      content: 'Loading...',
    })
    this.loading.present()
  }

  hideLoader(): void {
    this.log.verbose('LoginPage', 'hideLoader()')

    if (!this.loading) {
      return
    }
    this.loading.dismissAll()
    this.loading = null
  }

  gotoDashboardPage(): void {
    this.log.verbose('LoginPage', 'gotoDashboardPage()')

    this.navCtrl.setRoot(DashboardPage)
  }

  /**
   * Setup Push Service
   */
  async setupPush() {
    this.log.verbose('LoginPage', 'setupPush()')

    const pushToken = await this.push.register()
    await this.push.saveToken(pushToken)
    this.log.silly('LoginPage', 'setupPush() push token saved: %s', pushToken)

    this.push.rx.notification().subscribe((msg) => {
      this.log.silly('LoginPage', 'setupPush() notification received: %s - %s',
                                  msg.title, msg.text,
                    )
      alert(msg.title + ': ' + msg.text)
    })

    // do something with the push data
    // then call finish to let the OS know we are done
    // push.finish(function() {
    //     console.log("processing of push data is finished");
    // }, function() {
    //     console.log("something went wrong with push.finish for ID = " + data.additionalData.notId)
    // }, data.additionalData.notId);

  }
}
