// import fetch from 'node-fetch';
import { ChatGPTAPI } from 'chatgpt';

// store hardcoded for now
const sessionToken = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..yvNJUuc9KaRk_sbj.nNMhbRxVmw5OD_JdySmpj8te9CsFqb2zaz6e6-giPFhlgLSi53S7w2YPO6KPsA4WOnsWsQXc05Rxnyid0IYdVGQinAq8AcDqIDo1YKJCpHDRWyrC2fOT1_zHBDaABxYmuSdy6VzFvSlzQOdMaBrh3mgAiXVKjR3hRNvKNL04icimwWFJLkLGrFIMBR32t57ls0905i_cV2MzDX6BialxUbNq4okp-dbI8X9UA6lvjSYoKVvRekdZJCfzLciMaW9sOVwXALdv33UTnZhxuFkWusg15MKAB2IZKMFU8-gU2zowHoLZNb_QaAvR71hCosHNSAvA2fH1DUFDCHUuKMBY6LW0sT5d2ssvLbqc5YxNuXz2GRpAOF3dvudw3RWQCTkUcJ4yOorl6ZKV8OmPsVVSxhir4zIaDf9QG7UQHfkHX-3J8yVAB1mAHuQ5TT_Hi7E_9yoih-X95WmmMAkwZuTQc2nF9iOK2Qr4D1JCZ66__XbBwUlVBttA-sQEbtLOsQ38vvt57e0_8lsLuRx60oLxCHio-4aRVkCNUCDxo5wz3wT51q76BwmkMKLPq9kdclzVdbX2xWrIgCsF5a9SP6x4nvyZZJqBboR-1Q1TwgsvgE-N9foZUO5uYxMw8EkbMj9Zlzik9ngkhJf203T94i6IxhnkKvLrMtwBOUnpK2KfoLY3raI_VQfB84yiHTyMKrrRcdEca5azbCGWoRiiW_RfiobClWCvQWf3cJ8qJL_xNqrY0cJ8ueICvim3fBTqAnVRc8RsdigYPkni-yRS0FHayF-vZbPkWlW7qXmNwZWIIiKOavAYFWKskZgZ7FsKRDGeZXbWvYwL2ZC_B7B-wMZ3wi46KdazWedBAlbkudl6tkNfj5ofAWRc9rBWbvrTDMWmNCaVDeJAMZQ6NPIkPSyPzx1zWZd0bUlXo4Ob4fuxJNkcKf4l8E4r6I_dvO-yRLWIrWHx-_smQY1S3a17FRgNq5BJrIhg6tR80TQ-8UyRINffQRfCszIbJ36ptWVXchPVKmWlV9pOeAu-9E4I5aCeIW1G5W9eIAu4buAJZe5zUM43B4rNOMSoC8dvfG5UpVu5gFOOAK7wllbycCHSVdEhtJY2fyH1FyUieGhwJayTAfCXbiq6yHpLiAzP5LuK1jqPT4yBf1fcEzA18UIZwKkjBcvNGTNuHHhduj_YH0i2JO_TUIdHANHxo9KFC5uomkJCXSGDqQsoCGxFTzwP6yzy6-c-zGALFNOzLCws_lPEXRzDVb51hqmbLudMqOlfnKVgtSRyI24IeyYK6jccc6CjMS91218KcVgiFDfjJqXxeZ4hMpPr_B6e0xSNpnExoyt_gs-CSjOu06tZF49ZNUn0KufxVfsP3STrQUt3v7mKVBMdkvAMEjpO_r9p2WC3X1pUJ-tinNyfNjj8ZHjUqES_lTVq_d6oEeRMRgcC9yZplIwpjokDp0WDEm5AgfdGlREIHEIuO7_DxgYq1Nnr7e_hWalQZP9P1i1KzJR7Xb56jD043up8r9MCHfJmqPBe55_i9frE-VWS3cZoIPyz7fcbAA5bn-tI93dWjY_AH-yfc-5ys6Cgr3e_-wVLzNPmwdkWNzYV9MmLiIMfz7GxeDnBU3Tk9s-ZewPkwzdWLoUaYTTwhBTvJlazfr9WMmPx-KsR-XTGYSst3LA48gxENnkZesihX8D2HxXwE_eXH3lA9dwANketODuj47cIg4Z9YyEZpayJW4ClBoHrLjnE8qPFVSwZCWjzLpsqnEXVKXZ6dfKDPvGwNpXBKLCu2MOc8MAsABton-tVKaLk3ahb_NOw8k4hrsab88mMiZ2PR_XcDkAbODb5blY-l_FVeDnru8G9cTNC_ByqN_S1v9bpJmldkDDN7VTA4Z2pKsDWgLisFFU-WV_--dYvsnDrHw_QwJvpqh9nCEq_qvzQPOmuwdFWrEHE81rJPOwR9LItGVA2TiuWWDXtTUFOJyhGuXmJOASVT3XTZYLpKz55zbXW404DvYjDs6IeaeQ2EOSnHtXvgMjFU58tumhUH_OStwvGaERK04a6G6AzUnfqISTSTatceQWM40TWO45OrAU7zflK4u5TzTxG3-1lZmXJdYnP53qVaLPCjcKpij_NQjzPZ5HZ7oqTlitdMGIxmKmMX2jst-S85BriEBAUrxl5Pqb9-40nQL8Nnjx8qM20pvK31WyjSpQEt-z1u4kdZYUX8AmKzABCsCEnOGJxC0tbOBhyqVi_3a02PzB715IrbJfNniT-6GecLf4a.ghLwD6I18-LXokQfXh8M7g";


export const sendMessage = async (text: string) => {
    // const controller = new AbortController();
    // const response = await fetch('https://chat.openai.com/backend-api/conversation', {
    //     headers: {
    //         Authorization: `Bearer ${sessionToken}`,
    //         'Content-Type': 'application/json',
    //     },
    //     // signal: controller.signal
    // });

    // if (response.body) {
    //     for await (const chunk of response.body) {
    //         console.dir(JSON.parse(chunk.toString()));
    //     }
    // }

    const api = new ChatGPTAPI({ sessionToken });

    await api.ensureAuth();

    return api.sendMessage(text);
};