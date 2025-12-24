from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm, CustomSetPasswordForm

urlpatterns = [
    path('', views.profile, name='account_profile'),
    path('login/', views.login_view, name='account_login'),
    path('register/', views.register, name='account_register'),
    path('logout/', views.logout_view, name='account_logout'),

    # Сброс пароля — ввод email
    path('password_reset/', auth_views.PasswordResetView.as_view(
        template_name='account/password_reset.html',
        email_template_name='account/password_reset_email.html',
        subject_template_name='account/password_reset_subject.txt',
        form_class=CustomPasswordResetForm,
        success_url='/account/password_reset_done/'
    ), name='password_reset'),

    # Сообщение, что письмо отправлено
    path('password_reset_done/', auth_views.PasswordResetDoneView.as_view(
        template_name='account/password_reset_done.html'
    ), name='password_reset_done'),

    # Смена пароля по ссылке из письма
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='account/password_reset_confirm.html',
        form_class=CustomSetPasswordForm,
        success_url='/account/password_reset_complete/'
    ), name='password_reset_confirm'),

    # Подтверждение успешной смены пароля
    path('password_reset_complete/', auth_views.PasswordResetCompleteView.as_view(
        template_name='account/password_reset_complete.html'
    ), name='password_reset_complete'),
]
