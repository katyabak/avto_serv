from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from .forms import CustomPasswordResetForm, CustomSetPasswordForm

urlpatterns = [
    path('', views.profile, name='account_profile'),
    path('login/', views.login_view, name='account_login'),
    path('register/', views.register, name='account_register'),
    path('logout/', views.logout_view, name='account_logout'),
    path('list/', views.admin_panel, name='admin_panel'),
    path('application/', views.application, name='account_application'),
    path('application/success/', views.application_success, name='application_success'),
    path('application/<int:application_id>/update-status/', views.update_application_status,
         name='update_application_status'),
    path('my_applications/', views.my_applications, name='my_applications'),
    path('appointment/', views.appointment, name='appointment'),
    path('appointment/success/', views.appointment_success, name='appointment_success'),
    path('appointment/busy-times/', views.get_busy_times, name='busy_times'),
    path('appointment/<int:appointment_id>/update-status/', views.update_appointment_status,
         name='update_appointment_status'),

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
