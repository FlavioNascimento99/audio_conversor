
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  selectedFile = signal<File | null>(null);
  fileName = signal<string>('');
  transcription = signal<string>('');
  isTranscribing = signal<boolean>(false);
  errorMessage = signal<string>('');

  private readonly MAX_FILE_SIZE_MB = 5;
  private readonly SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];

  onFileSelected(event: Event): void {
    this.resetState();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
      this.errorMessage.set(`O arquivo excede o tamanho máximo de ${this.MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      this.errorMessage.set('Formato de arquivo não suportado. Use MP3, WAV ou OGG.');
      return;
    }
    
    this.selectedFile.set(file);
    this.fileName.set(file.name);
  }

  async transcribeAudio(): Promise<void> {
    const file = this.selectedFile();
    if (!file || this.isTranscribing()) {
      return;
    }

    this.isTranscribing.set(true);
    this.errorMessage.set('');
    this.transcription.set('');

    try {
      const result = await this.geminiService.generateTranscription(file.name);
      this.transcription.set(result);
    } catch (error) {
      console.error('Transcription error:', error);
      this.errorMessage.set('Ocorreu um erro ao gerar a transcrição. Tente novamente.');
    } finally {
      this.isTranscribing.set(false);
    }
  }

  resetState(): void {
    this.selectedFile.set(null);
    this.fileName.set('');
    this.transcription.set('');
    this.errorMessage.set('');
    this.isTranscribing.set(false);
  }
}
