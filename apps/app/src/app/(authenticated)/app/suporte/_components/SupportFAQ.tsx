'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/shadcn/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/shadcn/tabs';
import { FAQ_CATEGORIES } from '../_constants/faq-data';

export function SupportFAQ() {
  return (
    <Tabs defaultValue={FAQ_CATEGORIES[0].id} className="w-full">
      <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-2">
        {FAQ_CATEGORIES.map((category) => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {FAQ_CATEGORIES.map((category) => (
        <TabsContent key={category.id} value={category.id}>
          <Accordion type="single" collapsible className="w-full">
            {category.items.map((faq, idx) => (
              <AccordionItem key={idx} value={`${category.id}-${idx}`}>
                <AccordionTrigger className="text-left text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
