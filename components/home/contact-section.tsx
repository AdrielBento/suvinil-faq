'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ContactSectionProps = {
  onChatClick: () => void;
};

export function ContactSection({ onChatClick }: ContactSectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="contact-heading">
      <div className="space-y-2">
        <h2 id="contact-heading" className="text-2xl font-semibold tracking-tight">
          Não encontrou o que procurava?
        </h2>
        <p className="text-muted-foreground">Fale com a gente por qualquer um dos canais abaixo.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Telefone</CardTitle>
            <CardDescription>
              <strong className="block text-base font-semibold text-foreground">0800 011 7558</strong>
              <span className="text-sm text-muted-foreground">Seg. a sex., 8h–17h</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex gap-2 p-6 pt-0">
            <Button asChild className="w-full">
              <a href="tel:08000117558" aria-label="Ligar para 0800 011 7558">
                Ligar
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>E-mail</CardTitle>
            <CardDescription>Envie sua mensagem e retornaremos assim que possível.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex gap-2 p-6 pt-0">
            <Button asChild className="w-full" variant="outline">
              <a href="mailto:suporte@example.com">Enviar mensagem</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Chat online</CardTitle>
            <CardDescription>Seg. a sex., 8h–19h</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex gap-2 p-6 pt-0">
            <Button className="w-full" onClick={onChatClick}>
              Iniciar chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
