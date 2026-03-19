from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.forms import SetPasswordForm
from .models import Client
from .models import ClientApplication


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
        ('Запчасть1', 'Запчасть1'),
        ('Запчасть2', 'Запчасть2'),
        ('Запчасть3', 'Запчасть3'),
        ('Запчасть4', 'Запчасть4'),
        ('Запчасть5', 'Запчасть5'),
        ('Запчасть6', 'Запчасть6'),
        ('Запчасть7', 'Запчасть7'),
        ('Запчасть8', 'Запчасть8'),
        ('Запчасть9', 'Запчасть9'),
        ('Запчасть10', 'Запчасть10'),
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
