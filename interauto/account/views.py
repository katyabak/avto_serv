from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import RegisterForm, LoginForm, ClientUpdateForm
from django.contrib.auth.decorators import login_required


@login_required(login_url='/account/login/')
def profile(request):
    user = request.user

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
        'edit_mode': edit_mode
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
def logout_view(request):
    logout(request)
    return redirect('/account/login/')
