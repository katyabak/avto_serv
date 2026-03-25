from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.forms import SetPasswordForm
from .models import Client, Appointment
from .models import ClientApplication
import datetime


class RegisterForm(forms.ModelForm):
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Повторите пароль', widget=forms.PasswordInput)

    class Meta:
        model = Client
        fields = ('email', 'first_name', 'last_name', 'phone_number')
        labels = {
            'email': 'Email',
            'first_name': 'Имя',
            'last_name': 'Фамилия',
            'middle_name': 'Отчество',
            'phone_number': 'Телефон',
        }

    def clean_password2(self):
        p1 = self.cleaned_data.get('password1')
        p2 = self.cleaned_data.get('password2')
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError('Пароли не совпадают')
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class LoginForm(forms.Form):
    email = forms.EmailField(label='Email')
    password = forms.CharField(label='Пароль', widget=forms.PasswordInput)


class ClientUpdateForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['email', 'first_name', 'last_name', 'middle_name', 'phone_number']
        labels = {
            'email': 'Email',
            'first_name': 'Имя',
            'last_name': 'Фамилия',
            'middle_name': 'Отчество',
            'phone_number': 'Телефон',
        }


class CustomPasswordResetForm(PasswordResetForm):
    email = forms.EmailField(label='Email', max_length=254)

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not Client.objects.filter(email=email).exists():
            raise forms.ValidationError('Такой email не зарегистрирован. Введите другой.')
        return email


class CustomSetPasswordForm(SetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['new_password1'].label = 'Новый пароль'
        self.fields['new_password2'].label = 'Подтверждение нового пароля'
        self.fields['new_password1'].error_messages['password_mismatch'] = 'Пароли не совпадают'


class ApplicationForm(forms.ModelForm):
    detail = forms.CharField(required=True)

    delivery = forms.CharField(
        required=True
    )

    payment_method = forms.CharField(

        required=True
    )

    reservation = forms.CharField(
        required=True
    )

    reservation_days = forms.CharField(

        required=False
    )

    comment = forms.CharField(
        label="Комментарий",
        max_length=100,
        required=False,
        widget=forms.Textarea(attrs={'rows': 3})
    )

    class Meta:
        model = ClientApplication
        fields = [
            'detail',
            'delivery',
            'payment_method',
            'reservation',
            'reservation_days',
            'comment'
        ]

    def clean(self):
        cleaned_data = super().clean()
        reservation = cleaned_data.get('reservation')
        days = cleaned_data.get('reservation_days')

        if reservation == 'Да' and not days:
            raise forms.ValidationError("Укажите количество дней резервирования")
        if reservation == 'Нет':
            cleaned_data['reservation_days'] = 0
        return cleaned_data


class AppointmentForm(forms.ModelForm):
    service = forms.CharField(
        required=True
    )

    date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'})
    )

    time = forms.TimeField(required=True)
    brand = forms.CharField(required=True)

    year = forms.CharField(required=True)

    class Meta:
        model = Appointment
        fields = ['service', 'date', 'time', 'brand', 'year', 'comment']

    def clean_year(self):
        year = self.cleaned_data.get('year')

        if not year.isdigit():
            raise forms.ValidationError("Год должен содержать только цифры")

        if len(year) != 4:
            raise forms.ValidationError("Введите год в формате YYYY")

        year_int = int(year)
        current_year = datetime.datetime.now().year

        if year_int < 1900 or year_int > current_year:
            raise forms.ValidationError("Введите корректный год")

        return year_int
