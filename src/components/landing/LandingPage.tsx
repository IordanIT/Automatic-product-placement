"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Controls";
import { Tag } from "@/components/ui/Tag";
import { Monogram } from "@/components/brand/Wordmark";
import { ShelfBlueprint } from "./ShelfBlueprint";
import { StepAction, StepCapture, StepInference } from "./Illustrations";
import { INTEGRATIONS } from "./IntegrationMarks";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconChevronDown,
} from "@/components/ui/icons";

/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#metrics", label: "Результат" },
  { href: "#how", label: "Как это работает" },
  { href: "#integrations", label: "Интеграции" },
  { href: "#demo", label: "Демо" },
];

const METRICS = [
  {
    value: "−40%",
    title: "времени на инвентаризацию",
    body: "Точечная перепроверка только спорных фейсингов вместо сплошного обхода зала. Полный цикл по сети из 6 объектов — 4 часа 12 минут.",
    tag: "412 стеллажей",
  },
  {
    value: "99.8%",
    title: "точность детекции OOS",
    body: "Пустой фейсинг отличается от заполненного на 4–6 пикселей по верхней кромке. Модель detr-r50, дообучение на подтверждённых задачах сети.",
    tag: "порог 0.82",
  },
  {
    value: "+15%",
    title: "к полноте полки",
    body: "За счёт автоматической маршрутизации задач на конкретный фейсинг с координатами. Мерчандайзер идёт по маршруту, а не ищет eye-level.",
    tag: "OSA 94.2%",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Сканирование",
    body: "Камеры на потолке сектора или роботы-сканеры проходят маршрут по залу с заданной частотой. Кадр снимается в плоскости полки, без перспективных искажений.",
    meta: ["2.4 MP · f/2.8", "период 15 мин", "CAM / ROBOT"],
    art: <StepCapture />,
  },
  {
    n: "02",
    title: "Анализ компьютерным зрением",
    body: "Детекция находит границы фасок, распознаёт SKU по штрих-коду и классифицирует состояние: соответствует планограмме, пусто, стоит в чужой секции или развёрнут боком.",
    meta: ["детекция + классификация", "38 мс на кадр", "3 класса"],
    art: <StepInference />,
  },
  {
    n: "03",
    title: "Действие",
    body: "Аномалии ранжируются по влиянию на выручку и уходят в задачу мерчандайзеру либо в очередь пополнения WMS. Закрытие подтверждается фото «После» с повторной проверкой.",
    meta: ["приоритет по выручке", "маршрут по фейсингам", "фото-подтверждение"],
    art: <StepAction />,
  },
];

const CAPABILITIES = [
  ["01", "Сверка с цифровой планограммой", "Сравнение фактической выкладки с эталоном по SKU, фейсингу и ориентации упаковки."],
  ["02", "Расчётный OOS и OSA", "Оценка доступности товара на полке с учётом остатка в WMS и продаж за последние сутки."],
  ["03", "Фантомный остаток", "Товар числится в системе, но отсутствует на полке. Формируется задача на пересчёт ячейки."],
  ["04", "Маршрут мерчандайзера", "Задания собираются в маршрут по секторам с приоритетом по доле выручки."],
  ["05", "Контроль выполнения", "Фото «После» проверяется той же моделью. Задача закрывается только при совпадении с эталоном."],
  ["06", "Отчётность по объектам", "Срез по сети, зонам и SKU. Выгрузка в BI без дополнительной интеграции."],
];

export function LandingPage() {
  const [form, setForm] = React.useState({ name: "", company: "", email: "", format: "Гипермаркет" });
  const [sent, setSent] = React.useState(false);

  return (
    <div className="paper-grain min-h-screen bg-paper">
      {/* ============ nav ============ */}
      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-[2px]">
        <div className="mx-auto flex h-16 max-w-editorial items-center justify-between gap-6 px-5 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Monogram size={24} />
            <span className="leading-none">
              <span className="block font-display text-h4 leading-none">Полка</span>
              <span className="eyebrow mt-1 block !text-[0.5625rem] !tracking-[0.2em]">
                Shelf&nbsp;CV
              </span>
            </span>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="font-mono text-micro2 uppercase tracking-[0.12em] text-ink-muted transition-colors duration-200 ease-precise hover:text-ink"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/overview"
              className="hidden border border-line px-3 py-2 font-mono text-micro uppercase tracking-[0.12em] text-ink-muted transition-colors duration-200 ease-precise hover:border-brass hover:text-ink sm:inline-flex"
            >
              Войти в консоль
            </Link>
            <a href="#demo">
              <Button variant="primary" size="md">
                Запросить демо
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* ============ hero ============ */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 grid-fine opacity-60" />
        <div className="relative mx-auto grid max-w-editorial grid-cols-1 gap-10 px-5 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="eyebrow flex items-center gap-2.5">
                <span className="h-px w-8 bg-brass" />
                Компьютерное зрение для ритейла
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-h1 leading-[0.98] tracking-[-0.03em]">
                Идеальная полка.
                <br />
                <em className="font-normal italic text-slate">
                  Без ручного контроля.
                </em>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-[46ch] text-lead text-ink-muted">
                Система компьютерного зрения для ритейла. Сканируем стеллажи,
                сравниваем с планограммой и автоматически ставим задачи на
                выкладку — мерчандайзеру или роботу.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#demo">
                  <Button variant="primary" size="lg" className="justify-center">
                    Запросить демо
                    <IconArrowRight size={16} />
                  </Button>
                </a>
                <a href="#how">
                  <Button size="lg" className="justify-center">
                    Как это работает
                    <IconChevronDown size={15} />
                  </Button>
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-px border border-line bg-line">
                {[
                  ["6", "объектов в пилоте"],
                  ["1 284", "детекций в сутки"],
                  ["38 мс", "инференс на кадр"],
                ].map(([v, k]) => (
                  <div key={k} className="bg-paper px-3 py-3">
                    <dt className="tabular font-display text-h3 leading-none">{v}</dt>
                    <dd className="eyebrow mt-1.5 !text-[0.5625rem]">{k}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.1}>
              <figure className="relative">
                <div className="absolute -left-px -top-px h-4 w-4 border-l border-t border-brass" />
                <div className="absolute -right-px -top-px h-4 w-4 border-r border-t border-brass" />
                <div className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-brass" />
                <div className="absolute -bottom-px -right-px h-4 w-4 border-b border-r border-brass" />
                <div className="border border-line bg-paper-raised p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="eyebrow">Чертёж полки · ряд 12</span>
                    <span className="tabular font-mono text-micro text-ink-faint">
                      SH-1142 · rev 4
                    </span>
                  </div>
                  <ShelfBlueprint className="w-full" />
                </div>
                <figcaption className="mt-2 flex items-center justify-between font-mono text-micro text-ink-faint">
                  <span>фейсинг 1:1 · плановый вид</span>
                  <span className="tabular">масштаб 1:10</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ metrics ============ */}
      <section id="metrics" className="border-b border-line bg-paper-sunk">
        <div className="mx-auto max-w-editorial px-5 py-16 lg:px-8 lg:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-display text-h3 leading-none">До и после</h2>
              <p className="max-w-md text-small text-ink-muted">
                Замеры по пилотной сети из шести объектов. Период сравнения —
                12 недель до внедрения и 12 недель после.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {METRICS.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.07}>
                <div className="press group relative h-full border border-line bg-paper-raised p-5">
                  <span className="absolute -left-px -top-px h-3.5 w-3.5 border-l border-t border-brass" />
                  <span className="absolute -right-px -top-px h-3.5 w-3.5 border-r border-t border-brass" />
                  <span className="absolute -bottom-px -left-px h-3.5 w-3.5 border-b border-l border-brass" />
                  <span className="absolute -bottom-px -right-px h-3.5 w-3.5 border-b border-r border-brass" />

                  <div className="flex items-start justify-between gap-3">
                    <span className="tabular font-mono text-display leading-none tracking-tight">
                      {m.value}
                    </span>
                    <Tag tone="neutral">{m.tag}</Tag>
                  </div>
                  <h3 className="mt-4 font-display text-h4 leading-tight">{m.title}</h3>
                  <p className="mt-2.5 text-small leading-relaxed text-ink-muted">{m.body}</p>
                  <div className="mt-4 h-px w-full bg-line" />
                  <span className="eyebrow mt-3 block !text-ink-faint">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ how it works ============ */}
      <section id="how" className="border-b border-line">
        <div className="mx-auto max-w-editorial px-5 py-16 lg:px-8 lg:py-20">
          <Reveal>
            <div className="max-w-2xl">
              <span className="eyebrow text-brass-deep">Процесс</span>
              <h2 className="mt-3 font-display text-h2 leading-[1.05]">
                Три шага от кадра до задания.
                <br />
                <em className="font-normal italic text-ink-muted">
                  Без ручного контроля полки.
                </em>
              </h2>
            </div>
          </Reveal>

          <div className="mt-12 flex flex-col gap-10">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={0.05}>
                <article
                  className={cn(
                    "grid grid-cols-1 items-center gap-8 border-t border-line pt-8 lg:grid-cols-12 lg:gap-12",
                  )}
                >
                  <div
                    className={cn(
                      "lg:col-span-5",
                      i % 2 === 1 && "lg:order-2 lg:col-start-8",
                    )}
                  >
                    <div className="relative border border-line bg-paper-raised p-2">
                      <div className="absolute -left-px -top-px h-3 w-3 border-l border-t border-brass" />
                      <div className="absolute -right-px -bottom-px h-3 w-3 border-b border-r border-brass" />
                      {s.art}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "lg:col-span-6",
                      i % 2 === 1 ? "lg:order-1 lg:col-start-1" : "lg:col-start-7",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="tabular font-mono text-h4 text-brass-deep">{s.n}</span>
                      <span className="h-px w-10 bg-line-strong" />
                      <span className="eyebrow">шаг</span>
                    </div>
                    <h3 className="mt-3 font-display text-h3 leading-none">{s.title}</h3>
                    <p className="mt-3 max-w-[52ch] text-lead text-ink-muted">{s.body}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.meta.map((m) => (
                        <li key={m}>
                          <Tag tone="neutral">{m}</Tag>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ capabilities ============ */}
      <section className="border-b border-line bg-paper-sunk">
        <div className="mx-auto max-w-editorial px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <span className="eyebrow text-brass-deep">Возможности</span>
                <h2 className="mt-3 font-display text-h2 leading-[1.05]">
                  Что система
                  <br />
                  делает сама
                </h2>
                <p className="mt-4 max-w-sm text-small text-ink-muted">
                  Всё, что ниже, происходит без участия человека. Оператор видит
                  только то, что требует решения.
                </p>
                <Link href="/shelf" className="mt-6 inline-block">
                  <Button className="justify-center">
                    Открыть консоль
                    <IconArrowUpRight size={15} />
                  </Button>
                </Link>
              </div>
            </Reveal>

            <div className="lg:col-span-8">
              {CAPABILITIES.map(([n, t, b], i) => (
                <Reveal key={n} delay={i * 0.04}>
                  <div className="grid grid-cols-1 gap-2 border-t border-line py-5 sm:grid-cols-12 sm:gap-6">
                    <span className="tabular font-mono text-micro2 text-brass-deep sm:col-span-1">
                      {n}
                    </span>
                    <h3 className="font-display text-lead leading-tight sm:col-span-4">{t}</h3>
                    <p className="text-small text-ink-muted sm:col-span-7">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ integrations ============ */}
      <section id="integrations" className="border-b border-line">
        <div className="mx-auto max-w-editorial px-5 py-16 lg:px-8 lg:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="eyebrow text-brass-deep">Интеграции</span>
                <h2 className="mt-3 font-display text-h3 leading-none">Работает с вашим стеком</h2>
              </div>
              <p className="max-w-md text-small text-ink-muted">
                Обмен выполняется по протоколу WMS-XML 2.4 и REST. Поставка —
                от двух недель: монтаж камер, калибровка, обучение модели на
                данных сети.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
            {INTEGRATIONS.map((it, i) => (
              <Reveal key={it.id} delay={i * 0.05}>
                <div className="group flex h-full flex-col gap-3 bg-paper p-5 transition-colors duration-200 ease-precise hover:bg-paper-raised">
                  <div className="opacity-70 transition-opacity duration-200 group-hover:opacity-100">
                    {it.mark}
                  </div>
                  <div>
                    <div className="font-display text-small leading-tight">{it.name}</div>
                    <div className="mt-1 font-mono text-micro text-ink-faint">{it.note}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ demo ============ */}
      <section id="demo" className="relative overflow-hidden border-b border-line bg-paper-sunk">
        <div className="pointer-events-none absolute inset-0 grid-fine-lg opacity-50" />
        <div className="relative mx-auto grid max-w-editorial grid-cols-1 gap-10 px-5 py-16 lg:grid-cols-12 lg:px-8 lg:py-20">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-brass-deep">Демо</span>
            <h2 className="mt-3 font-display text-h2 leading-[1.05]">
              Покажем на
              <br />
              <em className="font-normal italic text-slate">ваших стеллажах</em>
            </h2>
            <p className="mt-4 max-w-sm text-small text-ink-muted">
              Пришлите планограмму одного сектора — покажем, что увидит модель на
              первом же кадре, и посчитаем экономию инвентаризации по вашим
              объёмам.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Разбор вашей текущей планограммы",
                "Оценка трудозатрат на инвентаризацию",
                "Пилот на одном объекте за 2 недели",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <IconCheck size={15} className="mt-1 shrink-0 text-forest" />
                  <span className="text-small text-ink-muted">{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <div className="relative border border-line bg-paper-raised p-5 lg:p-6">
              <span className="absolute -left-px -top-px h-4 w-4 border-l border-t border-brass" />
              <span className="absolute -right-px -top-px h-4 w-4 border-r border-t border-brass" />
              <span className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-brass" />
              <span className="absolute -bottom-px -right-px h-4 w-4 border-b border-r border-brass" />

              {sent ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
                  <IconCheck size={26} className="text-forest" />
                  <p className="font-display text-h4 leading-tight">Запрос принят</p>
                  <p className="max-w-sm text-small text-ink-muted">
                    Инженер свяжется в течение одного рабочего дня и предложит
                    время для разбора сектора.
                  </p>
                  <Button className="mt-2" onClick={() => setSent(false)}>
                    Отправить ещё одну заявку
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <Field label="Имя">
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Иван Петров"
                    />
                  </Field>
                  <Field label="Компания">
                    <Input
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Сеть магазинов"
                    />
                  </Field>
                  <Field label="Рабочая почта">
                    <Input
                      required
                      type="email"
                      mono
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="name@retail.ru"
                    />
                  </Field>
                  <Field label="Формат магазинов">
                    <Select
                      value={form.format}
                      onChange={(v) => setForm({ ...form, format: v })}
                      options={[
                        { value: "Гипермаркет", label: "Гипермаркет" },
                        { value: "Супермаркет", label: "Супермаркет" },
                        { value: "У дома", label: "У дома" },
                        { value: "Сеть", label: "Сеть магазинов" },
                      ]}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full justify-center"
                    >
                      Запросить демо
                      <IconArrowRight size={16} />
                    </Button>
                  </div>
                  <p className="font-mono text-micro text-ink-faint sm:col-span-2">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных
                    данных. Демо проводится на ваших данных, без обучения на них
                    публичной модели.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ footer ============ */}
      <footer className="bg-paper">
        <div className="mx-auto max-w-editorial px-5 py-14 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-8 border-b border-line pb-8">
            <div className="max-w-sm">
              <div className="flex items-center gap-2.5">
                <Monogram size={22} />
                <span className="font-display text-h3 leading-none">Полка</span>
              </div>
              <p className="mt-3 text-small text-ink-muted">
                Контроль выкладки на полке по цифровой планограмме.
                Компьютерное зрение, задачи, отчётность.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3">
              <FooterCol
                title="Продукт"
                items={[
                  ["Анализ полки", "/shelf"],
                  ["Планограммы", "/planograms"],
                  ["Задачи", "/tasks"],
                  ["Аналитика", "/analytics"],
                ]}
              />
              <FooterCol
                title="Компания"
                items={[
                  ["Как это работает", "#how"],
                  ["Интеграции", "#integrations"],
                  ["Демо", "#demo"],
                  ["Консоль", "/overview"],
                ]}
              />
              <div>
                <div className="eyebrow">Контакты</div>
                <ul className="mt-3 space-y-1.5">
                  <li className="tabular font-mono text-micro2 text-ink">+7 495 000-00-00</li>
                  <li className="tabular font-mono text-micro2 text-ink-muted">demo@shelf-cv.ru</li>
                  <li className="font-mono text-micro2 text-ink-muted">Москва, ул. Стеллажная, 1</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6 pt-8">
            <p className="font-display text-h3 leading-[1.05] text-ink-muted">
              <em className="font-normal italic">
                Полка должна стоять так, как написано в планограмме.
              </em>
            </p>
            <div className="text-right">
              <p className="eyebrow">© 2024 ООО «Полка CV»</p>
              <p className="mt-1.5 font-mono text-micro text-ink-faint">
                Дисклеймер: показатели на сайте — результаты пилота на
                конкретных объектах и не являются публичной гарантией.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string]>;
}) {
  return (
    <div>
      <div className="eyebrow">{title}</div>
      <ul className="mt-3 space-y-1.5">
        {items.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="font-mono text-micro2 text-ink-muted transition-colors duration-200 ease-precise hover:text-ink"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}