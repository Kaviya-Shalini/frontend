import { RouterModule, Routes } from '@angular/router';
import { OAuthCallbackComponent } from './oauth';
import { LoginComponent } from './login/login';
import { VerifyOtpComponent } from './verifyotp/verifyotp';
import { DashboardComponent } from './dashboard/dashboard';
import { UploadComponent } from './upload/upload';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { NgModule } from '@angular/core';
import { ShareComponent } from './share/share';
import { SettingsComponent } from './settings/settings';
import { MyWalletComponent } from './mywallet/mywallet';
import { HistoryComponent } from './history/history';
import { ForgotUsernameComponent } from './find-username/find-username';
import { Resetpassword } from './resetpassword/resetpassword';
import { otpforpasswordreset } from './otpforpassword/otpforpassword';
import { ReceivedFilesComponent } from './receivedfiles/receivedfiles';
import { SharedFilesComponent } from './sharedfiles/sharedfiles';
import { RegisterComponent } from './register/register';
import { AuthGuard } from './services/auth.guard';
import { DeleteFileComponent } from './delete/delete';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'oauth2/callback', component: OAuthCallbackComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'share/:id', component: ShareComponent, canActivate: [AuthGuard] },
  { path: 'delete/:id', component: DeleteFileComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'mywallet', component: MyWalletComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'forgot-username', component: ForgotUsernameComponent },
  { path: 'confirmpassword', component: Resetpassword },
  { path: 'otpforpasswordreset', component: otpforpasswordreset },
  { path: 'receivedfiles', component: ReceivedFilesComponent, canActivate: [AuthGuard] },
  { path: 'sharedfiles', component: SharedFilesComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
