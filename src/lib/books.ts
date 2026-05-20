import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const root = process.cwd();

const referenceDefinitionPattern = /^\[[^\]]+\]:\s*(?:<[^>]+>|\S+)(?:\s+["'][^"']+["'])?\s*$/gm;

export type BookChapter = {
  slug: string;
  title: string;
  index: number;
  markdown: string;
  excerpt: string;
  wordCount: number;
  readingMinutes: number;
};

export type Book = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  coverWidth: number;
  coverHeight: number;
  litresUrl?: string;
  litresAnnotation: string[];
  language: "ru";
  author: string;
  sourcePath: string;
  publishedYear: number;
  chapters: BookChapter[];
  wordCount: number;
  readingMinutes: number;
  references: string;
};

const bookSources = [
  {
    slug: "karnivor-dieta",
    title: "Карнивор Диета",
    subtitle: "Растения хотят нас отравить",
    description:
      "Русскоязычная книга о карнивор диете: принципы, переход, польза животной пищи, критика, частые вопросы и практические приложения.",
    coverImage: "/books/karnivor-dieta-cover.png",
    coverWidth: 1024,
    coverHeight: 1536,
    litresUrl:
      "https://www.litres.ru/book/grisha-gorbushkin/karnivor-dieta-rasteniya-hotyat-nas-otravit-72047857/",
    litresAnnotation: [
      "Карнивор диета основанная исключительно на продуктах животного происхождения. Автор подробно объясняет биологические основы и эволюционные предпосылки диеты, состоящей преимущественно из мяса, рыбы и яиц, и опровергает распространённые мифы о вреде животных жиров и необходимости растительной пищи.",
      "Читатель найдёт научные обоснования пользы карнивор диеты для похудения, нормализации обмена веществ, борьбы с аутоиммунными заболеваниями и улучшения общего самочувствия. Также реальные истории людей, достигших впечатляющих результатов в здоровье и спорте.",
      "«Карнивор диета» станет незаменимым руководством для тех, кто хочет разобраться в основах питания на животной пище, понять механизмы работы организма без растительных продуктов и принять взвешенное решение о своём здоровье и образе жизни.",
    ],
    language: "ru" as const,
    author: "Гриша Горбушкин",
    sourcePath: path.join(root, "manuscripts", "karnivor-dieta", "karnivor-dieta.md"),
    publishedYear: 2026,
  },
  {
    slug: "paleo-dieta",
    title: "Палео диета",
    subtitle: "Отказ от неподходящей пищи, продуктов глубокой промышленной переработки, мусора и ядов",
    description:
      "Практичная русскоязычная книга о палео-диете: отказ от сахара, зерновых, фастфуда, промышленных масел и продуктов глубокой переработки в пользу простой натуральной еды.",
    coverImage: "/books/paleo-dieta-cover.png",
    coverWidth: 1024,
    coverHeight: 1536,
    litresAnnotation: [
      "Если после обеда вас клонит в сон, сладкое управляет настроением, вес ползёт вверх, а «правильное питание» каждый раз заканчивается срывом, проблема может быть не в вашей силе воли. Проблема — в пище, которая годами ломает аппетит, энергию и здоровье.",
      "Эта книга для тех, кто устал быть заложником сахара, хлеба, фастфуда, доставок, энергетиков и еды из ярких коробок. Это не книга про «есть всё в меру». Это книга о том, как перестать кормить себя мусором, вернуть контроль над голодом и почувствовать, на что действительно способно ваше тело.",
      "Гриша Горбушкин показывает палео не как модную диету, а как первый жёсткий и практичный шаг обратно к нормальной еде: мясу, рыбе, яйцам, бульонам, натуральным жирам, сезонным овощам, ягодам и домашней кухне без промышленных «мутантов». Внутри — личная история автора, 30-дневный план, разбор ресторанов, стресса, сна, фитнеса, чтения составов, срывов, голодания, кето и карнивора как следующих, более сильных ступеней.",
    ],
    language: "ru" as const,
    author: "Гриша Горбушкин",
    sourcePath: path.join(root, "manuscripts", "paleo-dieta", "paleo-dieta.md"),
    publishedYear: 2026,
  },
  {
    slug: "vilhjalmur-stefansson",
    title: "Вильялмур Стефанссон и карнивор диета",
    subtitle:
      "Как более века назад мясо-жировая диета много лет помогала жить и работать в суровой Арктике и выдержала годичный медицинский эксперимент в США, о котором забыли",
    description:
      "Книга о Вильялмуре Стефанссоне, его жизни среди северных народов, эксперименте Bellevue, пеммикане, животном жире и страхах вокруг питания без растений.",
    coverImage: "/books/vilhjalmur-stefansson-cover.png",
    coverWidth: 1055,
    coverHeight: 1491,
    litresUrl:
      "https://www.litres.ru/book/grisha-gorbushkin/vilyalmur-stefansson-i-karnivor-dieta-kak-bolee-veka-naz-73879584/",
    litresAnnotation: [
      "Вильялмур Стефансон был не кабинетным теоретиком, а арктическим исследователем, который годами жил и работал на Севере среди людей, питавшихся мясом, рыбой и жиром. Он пришёл в Арктику с обычными страхами своего времени: без овощей будет цинга, много мяса разрушит почки, жир опасен, а человеку нужна «сбалансированная» смешанная пища. Но северный опыт изменил его взгляды.",
      "Эта книга рассказывает, как мясо-жировая диета помогала Стефансону в суровой Арктике, почему жир был не врагом, а главным топливом, что ели инуиты начала XX века, чем свежее мясо отличается от плохих экспедиционных пайков, почему кариес пришёл вместе с сахаром и мукой, и какую роль играл пеммикан.",
      "Главная часть книги — забытый годичный медицинский эксперимент в США, где Стефансон и Карстен Андерсон питались только животной пищей под наблюдением врачей. Кровь, почки, кетоз, мочевая кислота, холестерин, глюкоза — всё было проверено. Результат оказался неудобным для старых пищевых догм: мясо и жир выдержали испытание.",
    ],
    language: "ru" as const,
    author: "Гриша Горбушкин",
    sourcePath: path.join(root, "manuscripts", "vilhjalmur-stefansson", "vilhjalmur-stefansson.md"),
    publishedYear: 2026,
  },
  {
    slug: "owsley-stanley",
    title: "Оусли Стэнли и карнивор диета",
    subtitle:
      "Мудрость человека, прожившего более полувека без углеводов и растительной пищи, только на мясе и жире",
    description:
      "Книга об Оусли Стэнли, его полувековом мясо-жировом питании, правилах карнивора, отказе от растений, жире как топливе и дисциплине долгого пути.",
    coverImage: "/books/owsley-stanley-cover.png",
    coverWidth: 1048,
    coverHeight: 1501,
    litresUrl:
      "https://www.litres.ru/book/grisha-gorbushkin/stenli-ousli-i-karnivor-dieta-mudrost-cheloveka-prozhivs-73886678/",
    litresAnnotation: [
      "Оусли Стэнли по прозвищу Медведь был звукоинженером Grateful Dead, одним из создателей легендарной Стены звука и человеком, который больше полувека прожил на мясо-жировом питании. Он отвергал хлеб, овощи, фрукты, сладкий вкус и удобную сказку миф «всё в меру». Для него животная пища была не диетой, а возвращением к норме.",
      "Почему после каш, хлеба и сладкого тело снова просит есть? Почему Стэнли видел в «балансе» капитуляцию? Почему считал растения культурной ошибкой, а жир — главным топливом? Почему многие сдаются не из-за физиологии, а из-за семейных сценариев, страха, социальной неловкости и зависимости от привычной еды?",
      "Перед вами карнивор не как мода, а как система, которую один человек проверял десятилетиями. Эта книга для тех, кто интересуется низкоуглеводными диетами, кето, кетогенным питанием и карнивор диетой.",
    ],
    language: "ru" as const,
    author: "Гриша Горбушкин",
    sourcePath: path.join(root, "manuscripts", "owsley-stenly", "owsley-stanley.md"),
    publishedYear: 2026,
  },
  {
    slug: "common-drugs",
    title: "Алкоголь, кофеин и сахар как бытовые наркотики",
    subtitle: "Ненаучные заметки о веществах вызывающих зависимость",
    description:
      "Публицистическая книга о зависимости, культурной нормализации алкоголя, кофеина и сахара, индустрии привычек и практическом отказе от бытовых стимуляторов.",
    coverImage: "/books/common-drugs-cover.png",
    coverWidth: 1357,
    coverHeight: 784,
    litresAnnotation: [
      "Эта книга — жёсткий, публицистический и намеренно провокационный взгляд на три вещества, которые почти никто не привык ставить в один ряд: алкоголь, кофеин и сахар. Автор, адепт диеты животного происхождения и автор книги «Карнивор диета», предлагает посмотреть на них не как на безобидных спутников повседневной жизни, а как на бытовые наркотики, слишком глубоко встроенные в культуру, праздники, ритуалы, детство, отдых и представления о «нормальной жизни».",
      "В книге разбирается, как эти вещества маскируются под уют, награду, заботу, продуктивность, взрослость и традицию, как формируют тягу и зависимость, как создают пики и ямы, и почему именно их легальность и культурная защищённость делают их особенно коварными. Это не академический учебник, а живой, злой и местами очень личный текст для тех, кто готов усомниться в привычных мифах, сорвать красивую упаковку с общепринятого обмана и посмотреть на повседневные «маленькие радости» без самоуспокоения.",
    ],
    language: "ru" as const,
    author: "Гриша Горбушкин",
    sourcePath: path.join(root, "manuscripts", "common-drugs", "common-drugs.md"),
    publishedYear: 2026,
  },
];

let booksCache: Promise<Book[]> | undefined;

export async function getAllBooks(): Promise<Book[]> {
  booksCache ??= Promise.all(bookSources.map(loadBook));
  return booksCache;
}

export async function getBook(slug: string): Promise<Book | undefined> {
  const books = await getAllBooks();
  return books.find((book) => book.slug === slug);
}

export async function renderChapterMarkdown(book: Book, chapter: BookChapter): Promise<string> {
  const markdown = `${chapter.markdown}\n\n${book.references}`;
  return marked.parse(markdown, {
    async: false,
    gfm: true,
  }) as string;
}

async function loadBook(source: (typeof bookSources)[number]): Promise<Book> {
  const manuscript = await readFile(source.sourcePath, "utf8");
  const references = Array.from(manuscript.matchAll(referenceDefinitionPattern), (match) => match[0]).join("\n");
  const body = manuscript.replace(referenceDefinitionPattern, "").trim();
  const chapters = splitIntoChapters(body);
  const wordCount = chapters.reduce((total, chapter) => total + chapter.wordCount, 0);

  return {
    ...source,
    chapters,
    references,
    wordCount,
    readingMinutes: readingMinutes(wordCount),
  };
}

function splitIntoChapters(markdown: string): BookChapter[] {
  const lines = markdown.split(/\r?\n/);
  const chapters: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } | undefined;

  for (const line of lines) {
    const heading = line.match(/^#\s+(.+?)\s*$/);
    if (heading) {
      if (current) chapters.push(current);
      current = { title: cleanTitle(heading[1]), lines: [] };
      continue;
    }

    current?.lines.push(line);
  }

  if (current) chapters.push(current);

  const usedSlugs = new Set<string>();
  return chapters.map((chapter, index) => {
    const markdown = chapter.lines.join("\n").trim();
    const wordCount = countWords(markdown);

    return {
      slug: uniqueSlug(slugify(chapter.title), usedSlugs),
      title: chapter.title,
      index,
      markdown,
      excerpt: excerptFromMarkdown(markdown),
      wordCount,
      readingMinutes: readingMinutes(wordCount),
    };
  });
}

function cleanTitle(value: string): string {
  return value
    .replace(/!\[[^\]]*]\[[^\]]+]/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]+]\([^)]+\)/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\\([.!+?-])/g, "$1")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u20e3\ufe0e\ufe0f]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFromMarkdown(markdown: string): string {
  const paragraph = markdown
    .split(/\n{2,}/)
    .map((part) => stripMarkdown(part).trim())
    .find((part) => part.length > 80 && !isUrlOnly(part));

  if (!paragraph) return "";
  return paragraph.length > 220 ? `${paragraph.slice(0, 217).trim()}...` : paragraph;
}

function stripMarkdown(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<((?:https?|mailto):[^>\s]+)>/gi, "$1")
    .replace(/!\[[^\]]*]\[[^\]]+]/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`|[\]\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUrlOnly(value: string): boolean {
  return /^(?:https?:\/\/|mailto:)\S+$/i.test(value);
}

function countWords(markdown: string): number {
  const plain = stripMarkdown(markdown).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return plain ? plain.split(/\s+/).length : 0;
}

function readingMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 220));
}

function uniqueSlug(base: string, used: Set<string>): string {
  const fallback = base || "chapter";
  let slug = fallback;
  let counter = 2;

  while (used.has(slug)) {
    slug = `${fallback}-${counter}`;
    counter += 1;
  }

  used.add(slug);
  return slug;
}

function slugify(value: string): string {
  const transliterated = Array.from(value.toLowerCase())
    .map((character) => cyrillicMap[character] ?? character)
    .join("");

  return transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const cyrillicMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};
