from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.utils.i18n import gettext as _

import glv

def get_payment_keyboard(good) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    yoo = glv.config['YOOKASSA_SHOPID'] and glv.config['YOOKASSA_TOKEN']
    crypt = glv.config['MERCHANT_UUID'] and glv.config['CRYPTO_TOKEN']
    stars = glv.config['STARS_PAYMENT_ENABLED']
    f = yoo or crypt or start
    if not f:
        builder.row(
            InlineKeyboardButton(
                text="Oh no...",
                callback_data=f"none"
            )
        )
        return builder.as_markup()
    if yoo:
        builder.row(
            InlineKeyboardButton(
                text=_("ЮКасса (СБП, Картой) - ₽"),
                callback_data=f"pay_kassa_{good['callback']}"
            )
        )
    if crypt:
        builder.row(
            InlineKeyboardButton(
                text=f"Криптовалюта - $",
                callback_data=f"pay_crypto_{good['callback']}"
            )
        )
   
    if stars:
        builder.row(
            InlineKeyboardButton(
                text=f"Telegram ⭐️",
                callback_data=f"pay_stars_{good['callback']}"
            )
        )
    return builder.as_markup()
