import "dayjs/locale/nl";
import "dayjs/locale/de";
import en_US from "antd/locale/en_US";
import nl_NL from "antd/locale/nl_NL";
import de_DE from "antd/locale/de_DE";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import type { Locale as AntdLocal } from "antd/es/locale";
import { LocalEnum } from "#/enum";

type Locale = keyof typeof LocalEnum;
type Language = {
	locale: keyof typeof LocalEnum;
	icon: string;
	label: string;
	antdLocal: AntdLocal;
};

export const LANGUAGE_MAP: Record<Locale, Language> = {
	[LocalEnum.en_US]: {
		locale: LocalEnum.en_US,
		label: "English",
		icon: "flag-us",
		antdLocal: en_US,
	},
	[LocalEnum.nl_NL]: {
		locale: LocalEnum.nl_NL,
		label: "Dutch",
		icon: "flag-nl",
		antdLocal: nl_NL,
	},
	[LocalEnum.de_DE]: {
		locale: LocalEnum.de_DE,
		label: "German",
		icon: "flag-de",
		antdLocal: de_DE,
	},
};

export default function useLocale() {
	const { t, i18n } = useTranslation();

	const locale = (i18n.resolvedLanguage || LocalEnum.en_US) as Locale;
	const language = LANGUAGE_MAP[locale];

	/**
	 * localstorage -> i18nextLng change
	 */
	const setLocale = (locale: Locale) => {
		i18n.changeLanguage(locale);
		// set lang ant dayjs
		document.documentElement.lang = locale;
		const dayjsLocale = locale === 'nl_NL' ? 'nl' : locale === 'de_DE' ? 'de' : locale;
		dayjs.locale(dayjsLocale);
	};

	return {
		t,
		locale,
		language,
		setLocale,
	};
}
