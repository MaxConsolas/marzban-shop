const cyr = {
  yuUpper: '\u042E',
  yaLower: '\u044F',
  kaUpper: '\u041A',
  kaLower: '\u043A',
  aLower: '\u0430',
  esUpper: '\u0421',
  esLower: '\u0441',
  beUpper: '\u0411',
  peUpper: '\u041F',
  peLower: '\u043F',
  oLower: '\u043E',
  erLower: '\u0440',
  teLower: '\u0442',
  iLower: '\u0438',
  yLower: '\u044B',
  elLower: '\u043B',
  yuLower: '\u044E',
  deLower: '\u0434',
  veLower: '\u0432',
  enLower: '\u043D',
  eeLower: '\u0435',
  emLower: '\u043C',
  shortI: '\u0439',
  tseLower: '\u0446',
  hyphen: '-',
  space: ' '
} as const;

const word = {
  yookassa: `${cyr.yuUpper}${cyr.kaUpper}${cyr.aLower}${cyr.esLower}${cyr.esLower}${cyr.aLower}`,
  sbp: `${cyr.esUpper}${cyr.beUpper}${cyr.peUpper}`,
  kartoy: `${cyr.kaUpper}${cyr.aLower}${cyr.erLower}${cyr.teLower}${cyr.oLower}${cyr.shortI}`,
  cryptovaluta: `${cyr.kaUpper}${cyr.erLower}${cyr.iLower}${cyr.peLower}${cyr.teLower}${cyr.oLower}${cyr.veLower}${cyr.aLower}${cyr.elLower}${cyr.yuLower}${cyr.teLower}${cyr.aLower}`,
  podpiska: `${cyr.peUpper}${cyr.oLower}${cyr.deLower}${cyr.peLower}${cyr.iLower}${cyr.esLower}${cyr.kaLower}${cyr.aLower}`,
  na: `${cyr.enLower}${cyr.aLower}`,
  servis: `${cyr.esLower}${cyr.eeLower}${cyr.erLower}${cyr.veLower}${cyr.iLower}${cyr.esLower}`,
  kolvo: `${cyr.kaLower}${cyr.oLower}${cyr.elLower}${cyr.hyphen}${cyr.veLower}${cyr.oLower}`,
  mesyacev: `${cyr.emLower}${cyr.eeLower}${cyr.esLower}${cyr.yaLower}${cyr.tseLower}${cyr.eeLower}${cyr.veLower}`
} as const;

export const emoji = {
  wave: '\u{1F44B}\u{1F3FB}',
  downArrow: '\u{2B07}\u{FE0F}',
  surfer: '\u{1F3C4}\u{1F3FB}\u{200D}\u{2642}\u{FE0F}',
  free: '\u{1F13B}',
  profile: '\u{1F464}',
  info: '\u{2139}\u{FE0F}',
  heart: '\u{2764}\u{FE0F}',
  link: '\u{1F517}',
  hug: '\u{1F917}',
  check: '\u{2705}',
  star: '\u{2B50}\u{FE0F}',
  ruble: '\u{20BD}'
} as const;

export const phrases = {
  mainMenuGreeting: `Hello, {name} ${emoji.wave}\n\nSelect an action ${emoji.downArrow}`,
  joinButton: `Join${emoji.surfer}`,
  supportButton: `Support ${emoji.heart}`,
  freeButton: `5 days free ${emoji.free}`,
  subscriptionButton: `My subscription ${emoji.profile}`,
  faqButton: `Frequent questions ${emoji.info}`,
  chooseTariff: `Choose the appropriate tariff ${emoji.downArrow}`,
  subscriptionPage: `Subscription page ${emoji.downArrow}`,
  profileInactive: `Your profile is not active at the moment.\n\u{FE0F}\nYou can choose "5 days free ${emoji.free}" or "Join ${emoji.surfer}".`,
  followLink: `Follow the <a href="{link}">link</a> ${emoji.link}`,
  supportMessage: `Follow the <a href="{link}">link</a> and ask us a question. We are always happy to help ${emoji.hug}`,
  subscriptionAvailable: `Your subscription is available in the "My subscription ${emoji.profile}" section.`,
  thankYou: `Thank you for choice ${emoji.heart}\n\u{FE0F}\n<a href="{link}">Subscribe</a> so you don't miss any announcements ${emoji.check}\n\u{FE0F}\nYour subscription is purchased and available in the "My subscription ${emoji.profile}" section.`,
  renewReminder: `Hello, {name} ${emoji.wave}\n\nThank you for using our service ${emoji.heart}\n\u{FE0F}\nYour VPN subscription expires {day}, at the end of the day.\n\u{FE0F}\nTo renew it, just go to the "Join ${emoji.surfer}" section and make a payment.`,
  toBePaidRuble: `To be paid - {amount}${emoji.ruble} ${emoji.downArrow}`,
  toBePaidDollar: `To be paid - {amount}$ ${emoji.downArrow}`,
  toBePaidStars: `To be paid - {amount}${emoji.star} ${emoji.downArrow}`,
  selectPaymentMethod: `Select payment method ${emoji.downArrow}`,
  subscriptionForMonths: 'Subscription for {amount} month',
  yookassaButton: `${word.yookassa} (${word.sbp}, ${word.kartoy}) - ${emoji.ruble}`,
  cryptoButton: `${word.cryptovaluta} - $`,
  telegramStarsButton: `Telegram ${emoji.star}`,
  followButton: `Follow ${emoji.link}`,
  backButton: '\u23EA Back',
  payLabel: 'Pay',
  infoUnavailable: 'Information page is temporarily unavailable.',
  supportNotConfigured: 'Support contact is not configured yet.',
  today: 'today',
  tomorrow: 'tomorrow'
} as const;

export const yookassaDescriptions = {
  subscriptionTitle: `${word.podpiska} ${word.na} VPN `,
  subscriptionItem: `${word.podpiska} ${word.na} VPN ${word.servis}: ${word.kolvo} ${word.mesyacev} - {months}`
} as const;
