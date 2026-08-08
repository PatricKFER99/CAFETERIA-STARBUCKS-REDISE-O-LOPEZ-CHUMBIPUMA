// Importamos la librería de Supabase directamente desde el CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// URL de tu proyecto en Supabase (DataCraft Victory)
const supabaseUrl = 'https://jztcmtekhdutgwdufhci.supabase.co';

// Tu llave pública de Supabase
const supabaseKey = 'sb_publishable_2G1HCWh4Hn0FXB0kA1aXog_s6R3ATtS'; 

// Inicializamos la conexión y la exportamos para usarla en la web
export const supabase = createClient(supabaseUrl, supabaseKey);