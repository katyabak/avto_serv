from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout

from .constants import CAR_BRANDS, SERVICE_CHOICE
from .forms import RegisterForm, LoginForm, ClientUpdateForm, AppointmentForm
from django.contrib.auth.decorators import login_required
from .forms import ApplicationForm
from .models import Client, ClientApplication, Appointment
from django.http import Http404, JsonResponse
from django.views.decorators.http import require_POST
import json
from account import constants


@login_required(login_url='/account/login/')
def profile(request):
    user = request.user

    applications = user.applications.all()

    if request.method == 'POST':
        form = ClientUpdateForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect('/account/')
    else:
        form = ClientUpdateForm(instance=user)

    edit_mode = request.GET.get('edit', '0') == '1'

    return render(request, 'account/profile.html', {
        'user': user,
        'form': form,
        'edit_mode': edit_mode,
        'applications': applications
    })


def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/account/')
    else:
        form = RegisterForm()
    return render(request, 'account/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('/account/')
            else:
                return render(request, 'account/login.html', {'form': form, 'error': 'Неверный email или пароль'})
    else:
        form = LoginForm()
    return render(request, 'account/login.html', {'form': form})


@login_required(login_url='/account/login/')
def admin_panel(request):
    if not request.user.is_staff:
        raise Http404("Такой страницы не существует")

    tab = request.GET.get('tab', 'clients')

    clients = []
    applications = []
    appointments = []

    if tab == 'clients':
        clients = Client.objects.all()
    elif tab == 'applications':
        applications = ClientApplication.objects.select_related('client').all().order_by('-created_at')
    elif tab == 'appointments':
        appointments = Appointment.objects.select_related('client').all().order_by('-created_at')

    return render(request, 'account/admin_panel.html', {
        'tab': tab,
        'clients': clients,
        'applications': applications,
        'appointments': appointments
    })


@login_required(login_url='/account/login/')
def application(request):
    user = request.user
    # Преобразуем списки в формат для JS
    detail_choices = [choice[0] for choice in constants.DETAIL_CHOICES]
    delivery_choices = constants.DELIVERY_CHOICES
    payment_choices = constants.PAYMENT_CHOICES
    reservation_choices = [choice for choice in constants.RESERVATION_CHOICES]
    reservation_days_choices = constants.RESERVATION_DAYS_CHOICES

    if request.method == 'POST':
        form = ApplicationForm(request.POST)

        if form.is_valid():
            application = form.save(commit=False)
            application.client = user
            application.save()

            return redirect('/account/application/success/')

    else:
        form = ApplicationForm()

    return render(request, 'account/application.html', {
        'form': form,
        'user': user,
        'detail_choices': detail_choices,
        'delivery_choices': delivery_choices,
        'payment_choices': payment_choices,
        'reservation_choices': reservation_choices,
        'reservation_days_choices': reservation_days_choices,
        'delivery': constants.DELIVERY_CHOICES
    })


@login_required(login_url='/account/login/')
def application_success(request):
    return render(request, 'account/application_success.html')


@login_required(login_url='/account/login/')
@require_POST
def update_application_status(request, application_id):
    """Обновление статуса заявки"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Доступ запрещен'}, status=403)

    try:
        data = json.loads(request.body)
        new_status = data.get('status')

        # Проверяем, что статус допустимый
        valid_statuses = ['waiting', 'accepted', 'canceled']
        if new_status not in valid_statuses:
            return JsonResponse({'error': 'Недопустимый статус'}, status=400)

        application = get_object_or_404(ClientApplication, id=application_id)
        application.status = new_status
        application.save()

        # Возвращаем обновленную информацию
        status_display = dict(application.STATUS_CHOICES).get(new_status, new_status)

        return JsonResponse({
            'success': True,
            'status': application.status,
            'status_display': status_display
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный формат данных'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required(login_url='/account/login/')
def appointment(request):
    user = request.user

    if request.method == 'POST':
        form = AppointmentForm(request.POST)

        if form.is_valid():
            appointment = form.save(commit=False)
            appointment.client = user
            appointment.save()

            return redirect('/account/appointment/success/')
    else:
        form = AppointmentForm()

    return render(request, 'account/appointment.html', {
        'form': form,
        'user': user,
        'service': SERVICE_CHOICE,
        'brands': CAR_BRANDS
    })


@login_required(login_url='/account/login/')
def appointment_success(request):
    return render(request, 'account/appointment_success.html')


@login_required
def get_busy_times(request):
    date = request.GET.get('date')

    busy_times = Appointment.objects.filter(
        date=date,
        status='accepted'
    ).values_list('time', flat=True)

    # переводим время в строку
    busy_times = [t.strftime("%H:%M") for t in busy_times]

    return JsonResponse({'busy_times': busy_times})


@login_required
@require_POST
def update_appointment_status(request, appointment_id):
    """Обновление статуса записи на СТО"""
    if not request.user.is_staff:
        return JsonResponse({'error': 'Доступ запрещен'}, status=403)

    try:
        data = json.loads(request.body)
        new_status = data.get('status')

        valid_statuses = ['waiting', 'accepted', 'canceled']
        if new_status not in valid_statuses:
            return JsonResponse({'error': 'Недопустимый статус'}, status=400)

        appointment = get_object_or_404(Appointment, id=appointment_id)
        appointment.status = new_status
        appointment.save()

        # Возвращаем обновленную информацию
        status_display = dict(Appointment.STATUS_CHOICES).get(new_status, new_status)

        return JsonResponse({
            'success': True,
            'status': appointment.status,
            'status_display': status_display
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный формат данных'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required(login_url='/account/login/')
def logout_view(request):
    logout(request)
    return redirect('/account/login/')
