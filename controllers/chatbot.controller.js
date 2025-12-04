//imports
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({});




const generateHealthReport = async (req, res) => {
    try{
        
        //entradas
        const bpm = req.body.bpm;
        const temperatura_corporal = req.body.temperatura_corporal; //(grados celcius)
        const presion_arterial = req.body.presion_arterial;

        //mensajes de validación
        if(!bpm){
            return res.status(401).json({
                message: "* Debe enviar bpm *",
            })
        }
        
        if(!temperatura_corporal){
            return res.status(401).json({
                message: "* Debe enviar temperatura corporal (en °C) *",
            })
        }

        if(!presion_arterial){
            return res.status(401).json({
                message: "* Debe enviar presion anterialk (ej. 120/80) *",
            })
        }

    
        //prompt
        //const prompt = "Genera in reporte de salud con la siguiente estructura: bpm:" + bpm + ", temperatura corporal: " + temperatura_corporal + " °C, presion arterial : " + presion_arterial + " . Damelo con la siguiente estructura, en json, de modo que lo pueda parsear de un solo com JSON.stringify(). Por esto mismo, dame solo el json, nada de comentarios ni texto extra. Esta es la estructura a la que te tiens que apegar: { oracion-introduccion : string (una oración); resumen-general: string (una oracion); consejos: string[] (dame 3, especificos a los datos),  conlusion: string (1 parrafo), oracion-final: string (1 oracion, que le pregunte como se siente, en un tono amigable pero cuya implicación de urgencia dependa de los demas datos)}. Escribe todo en un tono amigable y con algo de detalle excepto en los casos donde especificamente se indicó ser breve, como las de 1 oracion. En el resumen general, damelo con datos numericos que validen lo que se dice, y si se puede agrega emojis para que parezca más amigable."
        const prompt = "Genera in reporte de salud con la siguiente estructura: bpm:" + bpm + ", temperatura corporal: " + temperatura_corporal + " °C, presion arterial : " + presion_arterial + " . Damelo con la siguiente estructura en json, de modo que se pueda parsear de un solo con JSON.stringify(). Por esto mismo, dame solo el json, nada de comentarios no texto extra. La estructura del json debe ser {reporte:string}. La estructura interna de reporte debe ser bien separada para que no parezca un chorizo de texto. Por esto mismo, dame solo el texto. Esta es la estructura a la que te tiends que apegar: oracion de introduccion, resumen-genera (una o 2 oraciones), consejos (dame 3, especificos a los datos separados pur bullet points),  conlusion (1 parrafo), oracion-final (1 oracion, que le pregunte como se siente, en un tono amigable pero cuya implicación de urgencia dependa de los demas datos). Escribe todo en un tono amigable y con algo de detalle excepto en los casos donde especificamente se indicó ser breve, como las de 1 oracion. En el resumen general, damelo con datos numericos que validen lo que se dice, y si se puede agrega emojis para que parezca más amigable."
        
        //peticion
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        //console.log(response.text.substring(7, response.text.length - 4) + "\n\n")
        const json_return = JSON.parse(response.text.substring(7, response.text.length - 4));
        
        //resultados
        res.status(200).json({
            message: "Reporte de salud generado",
            reporte: json_return.reporte
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message: "Error, no se puede generar el reporte de salud",
        })
    }
   
}

const request = async (req, res) => {
    try{
        //entrada
        const user_prompt = req.body.user_prompt;

        //mensajes de validación
        if(!user_prompt){
            return res.status(400).json({
                message: "Reporte de salud generado",
                reporte: json_return
            })
        }
        //prompt
        const prompt = user_prompt + " -> genera una respuesta a este prompt referente a la salud del usuario. Si el prompt no tiene que ver directamente con la salud del usuario y como se siente , no les reespondas,di que no se puede porque no es un tema de salud, responder de manera educada (osea, rechazalos si la pregunta no es una que se le haría a un doctor en su trabajo, y NO lo reenfoques, solo rechazalo si ya la pregunta no viene con implicaciones de salud en la redacción original). Respondelo de manera amigable, dando consejos de salud que ayuden tomando de referencia la prompt, en formato json {respuesta: string (una general, y luego una lista de consejos, al menos 3, o mas, detallados y especificos a la prompt, dentro del mismo atributo respuesta, solo si el prompt aplica)}, sin texto adicional, solo el json de modo que se pueda usar JSON.parse() de un solo."
        
        //peticion
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        //console.log(response.text.substring(7, response.text.length - 4) + "\n\n")
        const json_return = JSON.parse(response.text.substring(7, response.text.length - 4));
        
        //resultados
        res.status(200).json({
            message: "Reporte de salud generado",
            data: json_return
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message: "Error, no se puede generar el reporte de salud",
        })
    }
   
}
//exports
module.exports = {
    generateHealthReport,
    request
}