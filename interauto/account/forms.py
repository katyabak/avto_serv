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
    DETAIL_CHOICES = [
        ('Кронштейн КАМАЗ буксировочной вилки левый /АВТОМАГНАТ/',
         'Кронштейн КАМАЗ буксировочной вилки левый /АВТОМАГНАТ/'),
        ('Гайка КАМАЗ сферическая (шток ПГУ)', 'Гайка КАМАЗ сферическая (шток ПГУ)'),
        ('Пружина КАМАЗ ПГУ оттяжная', 'Пружина КАМАЗ ПГУ оттяжная'),
        ('Шайба КАМАЗ регул гайки вилки рычага корзины сц', 'Шайба КАМАЗ регул гайки вилки рычага корзины сц'),
        ('Наконечник КАМАЗ реакт тяги КПП прав (53228) /АВТОМАГНАТ/',
         'Наконечник КАМАЗ реакт тяги КПП прав (53228) /АВТОМАГНАТ/'),
        ('Ручка КАМАЗ кулисы КПП 15 /АВТОМАГНАТ/', 'Ручка КАМАЗ кулисы КПП 15 /АВТОМАГНАТ/'),
        ('Хвостовик КАМАЗ прив КПП в сб (Ростар) корот.', 'Хвостовик КАМАЗ прив КПП в сб (Ростар) корот.'),
        ('Чехол КАМАЗ рычага наконечника опоры КПП', 'Чехол КАМАЗ рычага наконечника опоры КПП'),
        ('Кран КАМАЗ включ МОД', 'Кран КАМАЗ включ МОД'),
        ('Муфта КАМАЗ блокировки МОД /АВТОМАГНАТ/', 'Муфта КАМАЗ блокировки МОД /АВТОМАГНАТ/'),
    ]

    DELIVERY_CHOICES = [
        ('delivery', 'Доставка'),
        ('pickup', 'Самовывоз'),
    ]

    PAYMENT_CHOICES = [
        ('card', 'Карта'),
        ('cash', 'Наличные'),
    ]

    RESERVATION_CHOICES = [
        ('yes', 'Да'),
        ('no', 'Нет'),
    ]

    RESERVATION_DAYS_CHOICES = [
        (1, '1 день'),
        (2, '2 дня'),
        (3, '3 дня'),
    ]

    detail = forms.ChoiceField(choices=DETAIL_CHOICES, label="Запчасть")

    delivery = forms.ChoiceField(
        choices=DELIVERY_CHOICES,
        label="Доставка",
        required=True
    )

    payment_method = forms.ChoiceField(
        choices=PAYMENT_CHOICES,
        label="Способ оплаты",
        required=True
    )

    reservation = forms.ChoiceField(
        choices=RESERVATION_CHOICES,
        label="Резервирование",
        required=True
    )

    reservation_days = forms.ChoiceField(
        choices=RESERVATION_DAYS_CHOICES,
        label="Кол-во дней резервирования",
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

        if reservation == 'yes' and not days:
            raise forms.ValidationError("Укажите количество дней резервирования")

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
