import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AutocompleteInput from '@/components/AutocompleteInput';
import { tuttiComuni } from '@/utils/comuni';
import { useEffect } from 'react';
import { estraiDatiCodiceFiscale } from '@/utils/codiceFiscale';

const registrationSchema = z.object({
  nome: z.string().min(1, 'Il nome è obbligatorio'),
  cognome: z.string().min(1, 'Il cognome è obbligatorio'),
  email: z.string().email('Email non valida'),
  codiceFiscale: z.string().length(16, 'Il codice fiscale deve essere di 16 caratteri').regex(/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/i, 'Formato codice fiscale non valido'),
  dataNascita: z.string().min(1, 'La data di nascita è obbligatoria'),
  luogoNascita: z.string().min(1, 'Il luogo di nascita è obbligatorio'),
  residenzaComune: z.string().min(1, 'Il comune di residenza è obbligatorio'),
  residenzaIndirizzo: z.string().min(1, 'L\'indirizzo di residenza è obbligatorio'),
  telefono: z.string().min(1, 'Il numero di telefono è obbligatorio'),
  dipendente: z.enum(["no", "cittametropolitana", "capitalelavoro"], { errorMap: () => ({ message: 'Devi specificare il tuo rapporto di lavoro' }) }),
  dichiarazioneFoto: z.boolean().refine(val => val === true, 'Devi accettare questa dichiarazione'),
  dichiarazioneContenuti: z.boolean().refine(val => val === true, 'Devi accettare questa dichiarazione'),
  accettaTermini: z.boolean().refine(val => val === true, 'Devi accettare i termini'),
  accettaPrivacy: z.boolean().refine(val => val === true, 'Devi accettare la privacy policy'),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;

interface Step1DatiPersonaliProps {
  onStepSubmit: (data: RegistrationForm) => void;
  formData: RegistrationForm | null;
  setCfWarnings: (warnings: string[]) => void;
  cfWarnings: string[];
}

export default function Step1DatiPersonali({ onStepSubmit, formData, setCfWarnings, cfWarnings }: Step1DatiPersonaliProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: formData || {},
  });

  const dataNascita = watch('dataNascita');
  const codiceFiscale = watch('codiceFiscale');

  useEffect(() => {
    if (codiceFiscale && codiceFiscale.length === 16) {
      const datiCF = estraiDatiCodiceFiscale(codiceFiscale);
      
      if (datiCF.valid) {
        if (datiCF.dataNascita && !dataNascita) {
          setValue('dataNascita', datiCF.dataNascita);
        }

        const warnings: string[] = [];
        if (dataNascita && datiCF.dataNascita && datiCF.dataNascita !== dataNascita) {
          const dataFormattata = new Date(datiCF.dataNascita).toLocaleDateString('it-IT');
          warnings.push(`La data di nascita inserita non corrisponde al CF (dal CF: ${dataFormattata})`);
        }

        setCfWarnings(warnings);
      } else {
        setCfWarnings(datiCF.errors.map(err => `${err}`));
      }
    } else {
      setCfWarnings([]);
    }
  }, [codiceFiscale, dataNascita, setValue, setCfWarnings]);

  return (
    <form onSubmit={handleSubmit(onStepSubmit)}>
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Nome *</label>
          <input
            type="text"
            {...register('nome')}
            className="form-control"
            placeholder="Mario"
          />
          {errors.nome && <p className="text-danger small mt-1">{errors.nome.message}</p>}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Cognome *</label>
          <input
            type="text"
            {...register('cognome')}
            className="form-control"
            placeholder="Rossi"
          />
          {errors.cognome && <p className="text-danger small mt-1">{errors.cognome.message}</p>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Email *</label>
          <input
            type="email"
            {...register('email')}
            className="form-control"
            placeholder="mario.rossi@example.com"
          />
          {errors.email && <p className="text-danger small mt-1">{errors.email.message}</p>}
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Codice Fiscale *</label>
          <input
            type="text"
            {...register('codiceFiscale')}
            className="form-control text-uppercase"
            placeholder="RSSMRA85M01H501Z"
            maxLength={16}
          />
          {errors.codiceFiscale && (
            <p className="text-danger small mt-1">{errors.codiceFiscale.message}</p>
          )}
          
          {cfWarnings.length > 0 && (
            <div className="mt-1">
              {cfWarnings.map((warning, index) => (
                <p key={index} className="text-danger small mb-1">{warning}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        type="hidden"
        {...register('dataNascita')}
      />

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <Controller
            name="luogoNascita"
            control={control}
            render={({ field }) => (
              <AutocompleteInput
                label="Luogo di Nascita"
                value={field.value || ''}
                onChange={field.onChange}
                options={tuttiComuni}
                placeholder="Inizia a digitare..."
                error={errors.luogoNascita?.message}
                required
              />
            )}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Telefono *</label>
          <input
            type="tel"
            {...register('telefono')}
            className="form-control"
            placeholder="+39 333 1234567"
          />
          {errors.telefono && <p className="text-danger small mt-1">{errors.telefono.message}</p>}
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <Controller
            name="residenzaComune"
            control={control}
            render={({ field }) => (
              <AutocompleteInput
                label="Comune di Residenza"
                value={field.value || ''}
                onChange={field.onChange}
                options={tuttiComuni}
                placeholder="Inizia a digitare..."
                error={errors.residenzaComune?.message}
                required
              />
            )}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Indirizzo di Residenza (Via/Piazza) *</label>
          <input
            type="text"
            {...register('residenzaIndirizzo')}
            className="form-control"
            placeholder="Via Roma, 123"
          />
          {errors.residenzaIndirizzo && (
            <p className="text-danger small mt-1">{errors.residenzaIndirizzo.message}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">Rapporto di Lavoro *</label>
        <select
          {...register('dipendente')}
          className="form-select"
          defaultValue=""
        >
          <option value="" disabled>Scegli...</option>
          <option value="no">
            Non sono dipendente di Città metropolitana di Roma Capitale o di Capitale Lavoro SpA
          </option>
          <option value="cittametropolitana">
            Sono dipendente di Città metropolitana di Roma Capitale
          </option>
          <option value="capitalelavoro">
            Sono dipendente di Capitale Lavoro SpA
          </option>
        </select>
        {errors.dipendente && <p className="text-danger small mt-1">{errors.dipendente.message}</p>}
      </div>

      <div className="bg-light border rounded p-4 mb-4">
        <h3 className="h5 fw-bold mb-4">Dichiarazioni Obbligatorie</h3>
        
        <div className="form-check mb-3">
          <input
            type="checkbox"
            {...register('dichiarazioneFoto')}
            className="form-check-input"
            id="dichiarazioneFoto"
          />
          <label className="form-check-label small" htmlFor="dichiarazioneFoto">
            Dichiaro che le foto presentate sono state interamente ideate e scattate da me e assicuro 
            che sulle stesse non gravino diritti di nessun genere a favore di terzi, lasciando indenne 
            la Città metropolitana di Roma Capitale da qualsivoglia responsabilità *
          </label>
          {errors.dichiarazioneFoto && (
            <p className="text-danger small mt-1">{errors.dichiarazioneFoto.message}</p>
          )}
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            {...register('dichiarazioneContenuti')}
            className="form-check-input"
            id="dichiarazioneContenuti"
          />
          <label className="form-check-label small" htmlFor="dichiarazioneContenuti">
            Dichiaro che le foto caricate: (i) non contengono materiale
            Dichiaro che le foto caricate: (i) non contengono materiale osceno, esplicitamente sessuale, 
            violento, offensivo o diffamatorio; (ii) non contengono materiale discriminante per sesso, 
            etnia e religione; (iii) non contengono materiale politico *
          </label>
          {errors.dichiarazioneContenuti && (
            <p className="text-danger small mt-1">{errors.dichiarazioneContenuti.message}</p>
          )}
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            {...register('accettaTermini')}
            className="form-check-input"
            id="accettaTermini"
          />
          <label className="form-check-label small" htmlFor="accettaTermini">
            Dichiaro, sotto la propria responsabilità, ai sensi degli artt. 46 e 47 del D.P.R. 28 dicembre 
            2000, n. 445, di aver preso visione e di accettare tutte le clausole contenute nel bando senza 
            condizione alcuna *
          </label>
          {errors.accettaTermini && (
            <p className="text-danger small mt-1">{errors.accettaTermini.message}</p>
          )}
        </div>

        <div className="form-check mb-0">
          <input
            type="checkbox"
            {...register('accettaPrivacy')}
            className="form-check-input"
            id="accettaPrivacy"
          />
          <label className="form-check-label small" htmlFor="accettaPrivacy">
            Autorizzo la Città metropolitana di Roma Capitale al trattamento dei dati personali per la sola 
            espletazione delle pratiche relative al concorso ai sensi del Decreto Legislativo 196/2003 e del 
            Regolamento UE 679/2016 *
          </label>
          {errors.accettaPrivacy && (
            <p className="text-danger small mt-1">{errors.accettaPrivacy.message}</p>
          )}
        </div>
      </div>

      <div className="d-flex gap-3 pt-3">
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={cfWarnings.length > 0}
        >
          Continua allo Step 2
        </button>
      </div>
    </form>
  );
}
